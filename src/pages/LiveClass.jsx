import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../css/liveclass/liveClass.css';
import { createOffer, initWebRTC } from '../utils/webrtc';
import { useSocket } from '../socket/SocketContext';
import { useParams } from 'react-router-dom';
import { api } from '../utils/constant';
import { useSelector } from 'react-redux';

const LiveClassUI = () => {
  const { user } = useSelector(state => state.user);
  const localVideoRef = useRef(null);
  const [participants, setParticipants] = useState([]);
  const [pinUserId, setPinUserId] = useState(null);
  const remoteVideoRefs = useRef({}); // dynamic refs for each remote user
  const { id: roomId } = useParams();
  const socket = useSocket();

  const handleRemoteStream = (userId, stream) => {
    if (!remoteVideoRefs.current[userId]) {
      remoteVideoRefs.current[userId] = React.createRef();
    }
    const videoElement = remoteVideoRefs.current[userId].current;
    if (videoElement) {
      videoElement.srcObject = stream;
    }
  };

  useEffect(() => {
    const setupClass = async () => {
      if (!socket) return;
      try {
        const res = await api.get("course/you", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const isCreator = res.data.data.some(course => course.createdBy === user._id);
        socket.emit(isCreator ? "create-room" : "join-room", { courseId: roomId });
        await initWebRTC(localVideoRef, socket, roomId, user._id, handleRemoteStream);
      } catch (err) {
        console.error("Setup error:", err);
      }
    };

    setupClass();
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = ({ userId, name }) => {
      if (userId !== user._id && !participants.some(p => p.userId === userId)) {
        setParticipants(prev => [...prev, { userId, name }]);
        remoteVideoRefs.current[userId] = React.createRef();
      }
    };

    socket.on("user-joined", handleUserJoined);
    socket.on("already-joined-users", async ({ users }) => {
      setParticipants(users);
      await createOffer(socket, roomId, user._id, users);
    });    
    return () => socket.off("user-joined", handleUserJoined);
  }, [socket, user._id, participants]);

  const handlePinUser = (userId) => {
    setPinUserId(prev => (prev === userId ? null : userId));
  };

  return (
    <div className="live-class-container bg-dark text-white vh-100 d-flex flex-column">
      {/* Top Bar */}
      <div className="top-bar p-2 d-flex justify-content-between align-items-center">
        <div className="meeting-code">4:46 PM | <strong>bzi-zhe-ciw</strong></div>
        <div className="presenting-label">MANTRA to a new you (Presenting)</div>
      </div>

      {/* Main Content */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        <div className="shared-screen flex-grow-1 bg-black d-flex justify-content-center align-items-center position-relative">

          {/* Fullscreen Video */}
          <div className="position-absolute w-100 h-100">
            {pinUserId && remoteVideoRefs.current[pinUserId] ? (
              <video
                ref={remoteVideoRefs.current[pinUserId]}
                autoPlay
                className="w-100 h-100 object-fit-cover"
              />
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                className="w-100 h-100 object-fit-cover"
              />
            )}
          </div>

          {/* Mini video tiles */}
          <div className="position-absolute bottom-0 start-0 d-flex flex-wrap m-2 gap-2">
            {participants.map(participant => {
              if (participant.userId === pinUserId) return null;
              return (
                <div key={participant.userId} className="bg-dark rounded border p-1" style={{ width: 160, height: 120 }}>
                  <video
                    ref={remoteVideoRefs.current[participant.userId]}
                    autoPlay
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
              );
            })}

            {/* Show local video in small tile if someone else is pinned */}
            {pinUserId && (
              <div className="bg-dark rounded border p-1" style={{ width: 160, height: 120 }}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Participants Sidebar */}
        <div className="participants-column bg-secondary text-white p-2" style={{ width: '200px' }}>
          {participants.map((participant) => (
            <div key={participant.userId} className="participant-tile mb-2 bg-dark p-2 rounded text-center">
              {participant.name}
              <button
                className="btn btn-sm btn-light ml-2"
                onClick={() => handlePinUser(participant.userId)}
              >
                {pinUserId === participant.userId ? "Unpin" : "Pin"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="control-bar p-3 d-flex justify-content-center bg-dark gap-3">
        <button className="btn btn-danger rounded-circle control-btn" title="End Call">
          <i className="fas fa-phone-slash"></i>
        </button>
        <button className="btn btn-secondary rounded-circle control-btn" title="Toggle Mic">
          <i className="fas fa-microphone"></i>
        </button>
        <button className="btn btn-secondary rounded-circle control-btn" title="Toggle Camera">
          <i className="fas fa-video"></i>
        </button>
        <button className="btn btn-secondary rounded-circle control-btn" title="Share Screen">
          <i className="fas fa-desktop"></i>
        </button>
        <button className="btn btn-secondary rounded-circle control-btn" title="Raise Hand">
          <i className="fas fa-hand-paper"></i>
        </button>
        <button className="btn btn-secondary rounded-circle control-btn" title="Chat">
          <i className="fas fa-comment-dots"></i>
        </button>
        <button className="btn btn-secondary rounded-circle control-btn" title="More Options">
          <i className="fas fa-ellipsis-h"></i>
        </button>
      </div>
    </div>
  );
};

export default LiveClassUI;
