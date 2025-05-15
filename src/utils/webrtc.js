// utils/webrtc.js
const peerConnections = {}; // userId => RTCPeerConnection

export const initWebRTC = async (localVideoRef, socket, roomId, userId, onRemoteStream) => {
  const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  if (localVideoRef.current) {
    localVideoRef.current.srcObject = localStream;
  }

  // Listen for incoming offer
  socket.on("offer", async ({ userId: remoteUserId, offer }) => {
    const peer = createPeerConnection(socket, roomId, remoteUserId, onRemoteStream);
    peerConnections[remoteUserId] = peer;
    await peer.setRemoteDescription(new RTCSessionDescription(offer));

    // Add local tracks
    localStream.getTracks().forEach(track => peer.addTrack(track, localStream));

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("answer", {
      courseId: roomId,
      targetUserId: remoteUserId,
      answer,
    });
  });

  socket.on("answer", async ({ userId: remoteUserId, answer }) => {
    const peer = peerConnections[remoteUserId];
    if (peer) {
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
    }
  });

  socket.on("ice-candidate", ({ userId: remoteUserId, candidate }) => {
    const peer = peerConnections[remoteUserId];
    if (peer && candidate) {
      peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
  });
};

export const createOffer = async (socket, roomId, userId, existingUsers) => {
  const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

  for (const otherUser of existingUsers) {
    const peer = createPeerConnection(socket, roomId, otherUser.userId);
    peerConnections[otherUser.userId] = peer;

    localStream.getTracks().forEach(track => peer.addTrack(track, localStream));

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("offer", {
      courseId: roomId,
      targetUserId: otherUser.userId,
      offer,
    });
  }
};

const createPeerConnection = (socket, roomId, remoteUserId, onRemoteStream) => {
  const peer = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", {
        courseId: roomId,
        targetUserId: remoteUserId,
        candidate: event.candidate,
      });
    }
  };

  peer.ontrack = (event) => {
    const remoteStream = new MediaStream();
    remoteStream.addTrack(event.track);
    onRemoteStream(remoteUserId, remoteStream);
  };

  return peer;
};
