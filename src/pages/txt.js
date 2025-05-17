import React, { useEffect, useState, useRef } from 'react';
import Peer from 'peerjs';
import { useParams } from 'react-router-dom';
import { useSocket } from '../socket/SocketContext';
import { useSelector } from 'react-redux';
import { api } from '../utils/constant';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/liveclass/liveClass.css';

const GoogleMeetUI = () => {
  const socket = useSocket();
  const { user } = useSelector(state => state.user);
  const { id: courseId } = useParams();

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const [peerId, setPeerId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [camera, setCamera] = useState(false);
  const [mic, setMic] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [pinned, setPinned] = useState(null); // use peerId or 'local'

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setCamera(true);
      setMic(true);
      participants.forEach(({ peerId }) => {
        const call = peerRef.current.call(peerId, stream);
        call.on('stream', remoteStream => {
          setParticipants(prev => prev.map(p => p.peerId === call.peer ? { ...p, stream: remoteStream } : p));
        });
      });
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  const setupCallListener = () => {
    peerRef.current.on('call', call => {
      call.answer(localStreamRef.current);
      call.on('stream', remoteStream => {
        setParticipants(prev => prev.map(p => p.peerId === call.peer ? { ...p, stream: remoteStream } : p));
      });
    });
  };

  useEffect(() => {
    if (!socket || !user?.token) return;
    const init = async () => {
      try {
        const res = await api.get('course/you', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const youCreated = res.data.data.some(course => course._id === courseId);
        const peer = new Peer();
        peerRef.current = peer;
        peer.on('open', id => {
          setPeerId(id);
          if (youCreated) {
            socket.emit('create-room', { courseId, peerId: id });
          } else {
            socket.emit('join-room', { courseId, peerId: id });
          }
          setupCallListener();
        });
      } catch (error) {
        console.error("Failed to fetch your courses:", error);
      }
    };

    init();

    socket.on('user-joined', user => {
      setParticipants(prev => [...prev, { ...user }]);
    });

    socket.on('all-users', users => {
      setParticipants(users);
    });

    socket.on('user-left', ({ socketId }) => {
      setParticipants(prev => prev.filter(p => p.socketId !== socketId));
    });

    socket.on('room-ended', () => {
      setCallEnded(true);
    });

    window.addEventListener('beforeunload', handleEndCall);

    return () => {
      peerRef.current?.destroy();
      socket.off('user-joined');
      socket.off('all-users');
      socket.off('user-left');
      socket.off('room-ended');
      window.removeEventListener('beforeunload', handleEndCall);
    };
  }, [socket, user, courseId]);

  const handleEndCall = () => {
    socket.emit("end-call", { courseId });
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    setCallEnded(true);
  };

  const toggleCamera = async () => {
    if (!camera) {
      await startStream();
    } else {
      localStreamRef.current?.getVideoTracks().forEach(track => track.stop());
      setCamera(false);
    }
  };

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(track => track.enabled = !mic);
    setMic(prev => !prev);
  };

  const renderVideo = (stream, muted = false) => (
    <video
      className="w-100 h-100 object-fit-center rounded"
      autoPlay
      playsInline
      muted={muted}
      ref={video => video && (video.srcObject = stream)}
    />
  );

  const renderPlaceholder = (label) => (
    <div className="w-100 h-100 d-flex justify-content-center align-items-center bg-secondary text-white rounded">
      <h5>{label}</h5>
    </div>
  );

  const pinnedParticipant =
    pinned === 'local'
      ? { email: user.email, stream: localStreamRef.current }
      : participants.find(p => p.peerId === pinned);

  if (callEnded) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center bg-dark text-light">
        <h1>Call Ended</h1>
      </div>
    );
  }

  return (
    <div className="google-meet-container">
      <div className="video-main-view rounded">
        {pinnedParticipant?.stream
          ? renderVideo(pinnedParticipant.stream, pinned === 'local')
          : renderPlaceholder(pinnedParticipant?.email || 'You')}
        <div className="video-label">
          <i className="bi bi-pin-angle-fill me-2" />
          {pinnedParticipant?.email || 'You'}
        </div>
      </div>

      <div className="side-videos">
        {localStreamRef.current && (
          <div className="video-tile position-relative" onClick={() => setPinned('local')}>
            {localStreamRef.current ? renderVideo(localStreamRef.current, true) : renderPlaceholder('You')}
            <span className="video-tile-label">You</span>
            {pinned === 'local' && <span className="pin-overlay"><i className="bi bi-pin-fill" /></span>}
          </div>
        )}
        {participants.map(p => (
          <div
            key={p.peerId}
            className="video-tile position-relative"
            onClick={() => setPinned(p.peerId)}
          >
            {p.stream ? renderVideo(p.stream) : renderPlaceholder(p.name || p.email)}
            <span className="video-tile-label">{p.name || p.email}</span>
            {pinned === p.peerId && <span className="pin-overlay"><i className="bi bi-pin-fill" /></span>}
          </div>
        ))}
      </div>

      <div className="control-bar bg-dark text-light">
        <span className="me-3">Code: <strong>{courseId}</strong></span>
        <button onClick={toggleMic} className="btn btn-outline-light mx-2">
          <i className={`bi ${mic ? 'bi-mic-mute-fill' : 'bi-mic-fill'}`} />
        </button>
        <button onClick={toggleCamera} className="btn btn-outline-light mx-2">
          <i className={`bi ${camera ? 'bi-camera-video-off-fill' : 'bi-camera-video-fill'}`} />
        </button>
        <button onClick={handleEndCall} className="btn btn-danger mx-2">
          <i className="bi bi-telephone-x-fill" />
        </button>
      </div>
    </div>
  );
};

export default GoogleMeetUI; import Course from '../model/Course.js';
import User from '../model/User.js';

const rooms = {}; // courseId -> { createdBy, users: [ { socketId, peerId, userId, name } ] }

const registerSocketHandler = (io, socket) => {
  const user = socket.user;

  socket.on("create-room", async ({ courseId, peerId }) => {
    try {
      const course = await Course.findById(courseId);
      if (!course) return socket.emit("error", "Course not found");

      if (course.liveStatus === "live") {
        return socket.emit("error", "Class is already live");
      }

      const subscribers = await User.find({ subscription: courseId });

      course.liveStatus = "live";
      await course.save();

      rooms[courseId] = {
        createdBy: user._id.toString(),
        users: [{
          socketId: socket.id,
          peerId,
          userId: user._id.toString(),
          name: user.name,
        }]
      };

      socket.join(courseId);

      // Notify subscribers
      subscribers.forEach(sub => {
        io.to(sub._id.toString()).emit("live-class-started", course);
      });

      // Send current user list to frontend
      io.to(courseId).emit("all-users", rooms[courseId].users);

    } catch (err) {
      console.error("create-room error:", err);
      socket.emit("error", "Internal server error");
    }
  });

  socket.on("join-room", async ({ courseId, peerId }) => {
    try {
      const course = await Course.findById(courseId);
      if (!course) return socket.emit("error", "Course not found");

      if (course.liveStatus !== "live") {
        return socket.emit("error", "Live class is not started");
      }

      if (!rooms[courseId]) {
        rooms[courseId] = {
          createdBy: course.createdBy.toString(),
          users: []
        };
      }

      const newUser = {
        socketId: socket.id,
        peerId,
        userId: user._id.toString(),
        name: user.name,
      };

      rooms[courseId].users.push(newUser);
      socket.join(courseId);

      socket.to(courseId).emit("user-joined", newUser);
      socket.emit("all-users", rooms[courseId].users);

    } catch (err) {
      console.error("join-room error:", err);
      socket.emit("error", "Internal server error");
    }
  });

  socket.on("disconnect", async () => {
    try {
      for (const courseId in rooms) {
        const room = rooms[courseId];
        const index = room.users.findIndex(u => u.socketId === socket.id);

        if (index !== -1) {
          const userLeft = room.users[index];
          room.users.splice(index, 1);

          // Notify others
          socket.to(courseId).emit("user-left", {
            socketId: socket.id,
            userId: userLeft.userId,
            name: userLeft.name,
          });

          // Host disconnected
          if (room.createdBy === userLeft.userId) {
            await Course.findByIdAndUpdate(courseId, { liveStatus: "ended" });
            io.to(courseId).emit("room-ended", {
              message: "Class ended because the host disconnected",
            });
            delete rooms[courseId];
          }

          break;
        }
      }
    } catch (err) {
      console.error("disconnect error:", err);
    }
  });

  socket.on("end-call", async ({ courseId }) => {
    try {
      await Course.findByIdAndUpdate(courseId, { liveStatus: "ended" });
      io.to(courseId).emit("room-ended", { message: "Class ended by host" });
      delete rooms[courseId];
    } catch (err) {
      console.error("end-call error:", err);
    }
  });
};
export default registerSocketHandler make it fully proper functional same like google meet with fully working and add screen share and raise hand with best design or ui