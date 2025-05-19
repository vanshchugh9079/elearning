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
  const screenStreamRef = useRef(null);
  const [peerId, setPeerId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [camera, setCamera] = useState(false);
  const [mic, setMic] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [pinned, setPinned] = useState('local');
  const [raisedHands, setRaisedHands] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Check if mobile device
  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  // Get mobile-friendly constraints
  const getMobileConstraints = () => {
    return {
      video: {
        facingMode: 'user',
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        ...(isMobile && { frameRate: { ideal: 30, max: 60 } })
      },
      audio: true
    };
  };

  // Check camera availability
  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch (err) {
      console.error("Error enumerating devices:", err);
      return false;
    }
  };
  // Add to your component
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        // Reset mobile-specific states when switching to desktop
        setShowChat(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const startStream = async () => {
    try {
      const hasCamera = await checkCameraAvailability();
      if (!hasCamera) {
        throw new Error('No camera detected on this device');
      }

      const constraints = getMobileConstraints();
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Handle iOS specific quirks
      if (isMobile) {
        const videoTracks = stream.getVideoTracks();
        videoTracks.forEach(track => {
          track.onended = () => {
            setCamera(false);
            setCameraError('Camera was disconnected');
          };
        });
      }

      localStreamRef.current = stream;
      setCamera(true);
      setMic(true);
      setCameraError(null);

      // Connect to all existing participants
      participants.forEach(({ peerId }) => {
        const call = peerRef.current.call(peerId, stream);
        call.on('stream', remoteStream => {
          setParticipants(prev => prev.map(p => p.peerId === call.peer ? { ...p, stream: remoteStream } : p));
        });
      });
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setCamera(false);
      setMic(false);
      setCameraError(err.message);

      // Provide specific error messages
      if (err.name === 'NotAllowedError') {
        alert('Please enable camera permissions in your browser settings');
      } else if (err.name === 'NotFoundError') {
        alert('No camera found on this device');
      } else {
        alert(`Could not access camera: ${err.message}`);
      }
    }
  };

  const stopStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setCamera(false);
      setMic(false);
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      screenStreamRef.current = stream;
      setScreenShare(true);

      // Replace video track for all participants
      participants.forEach(({ peerId }) => {
        if (peerId !== peerRef.current?.id) {
          const call = peerRef.current.call(peerId, stream);
          call.on('stream', remoteStream => {
            setParticipants(prev => prev.map(p =>
              p.peerId === call.peer ? { ...p, stream: remoteStream } : p
            ));
          });
        }
      });

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error("Error accessing screen share:", err);
      alert(`Could not share screen: ${err.message}`);
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
      setScreenShare(false);

      // Restore camera stream if available
      if (localStreamRef.current) {
        participants.forEach(({ peerId }) => {
          if (peerId !== peerRef.current?.id) {
            const call = peerRef.current.call(peerId, localStreamRef.current);
            call.on('stream', remoteStream => {
              setParticipants(prev => prev.map(p =>
                p.peerId === call.peer ? { ...p, stream: remoteStream } : p
              ));
            });
          }
        });
      }
    }
  };

  const toggleScreenShare = async () => {
    if (screenShare) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  const setupCallListener = () => {
    peerRef.current.on('call', call => {
      call.answer(localStreamRef.current || undefined);
      call.on('stream', remoteStream => {
        setParticipants(prev => prev.map(p => p.peerId === call.peer ? { ...p, stream: remoteStream } : p));
      });
    });
  };

  const raiseHand = () => {
    socket.emit('raise-hand', { courseId, userId: user._id, name: user.name });
  };

  const lowerHand = () => {
    socket.emit('lower-hand', { courseId, userId: user._id });
  };

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        sender: user.name,
        text: message,
        timestamp: new Date().toLocaleTimeString(),
        isMe: true
      };
      socket.emit('send-message', { courseId, message: newMessage });
      setChatMessages(prev => [...prev, newMessage]);
      setMessage('');
    }
  };

  const handleOrientationChange = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const constraints = videoTrack.getConstraints();
        videoTrack.applyConstraints(constraints);
      }
    }
  };

  useEffect(() => {
    if (!socket || !user?.token) return;

    const init = async () => {
      try {
        const res = await api.get('course/you', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const youCreated = res.data.data.some(course => course._id === courseId);
        setIsHost(youCreated);

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

        peer.on('error', err => {
          console.error('PeerJS error:', err);
          alert(`Connection error: ${err.message}`);
        });
      } catch (error) {
        console.error("Failed to fetch your courses:", error);
      }
    };

    init();

    // Add mobile orientation listener
    if (isMobile) {
      window.addEventListener('orientationchange', handleOrientationChange);
    }

    socket.on('user-joined', newUser => {
      // Add the new user to participants list
      setParticipants(prev => {
        if (!prev.some(p => p.userId === newUser.userId)) {
          return [...prev, newUser];
        }
        return prev;
      });

      // If we have any stream (camera or screen share), send it to the new user
      if (peerRef.current && (localStreamRef.current || screenStreamRef.current)) {
        const streamToSend = screenStreamRef.current || localStreamRef.current;

        const call = peerRef.current.call(newUser.peerId, streamToSend);
        call.on('stream', remoteStream => {
          setParticipants(prev => prev.map(p =>
            p.peerId === call.peer ? { ...p, stream: remoteStream } : p
          ));
        });

        call.on('error', err => {
          console.error('Call error:', err);
        });
      }
    });

    socket.on('all-users', users => {
      setParticipants(users.filter(u => u.userId !== user._id));
    });

    socket.on('user-left', ({ userId }) => {
      setParticipants(prev => prev.filter(p => p.userId !== userId));
      setRaisedHands(prev => prev.filter(id => id !== userId));
    });

    socket.on('room-ended', () => {
      setCallEnded(true);
      stopStream();
      stopScreenShare();
    });

    socket.on('raise-hand', ({ userId }) => {
      setRaisedHands(prev => [...prev, userId]);
    });

    socket.on('lower-hand', ({ userId }) => {
      setRaisedHands(prev => prev.filter(id => id !== userId));
    });

    socket.on('receive-message', (message) => {
      setChatMessages(prev => [...prev, { ...message, isMe: false }]);
    });

    socket.on('chat-history', (messages) => {
      setChatMessages(messages);
    });

    socket.on('raised-hands', (hands) => {
      setRaisedHands(hands);
    });

    window.addEventListener('beforeunload', handleEndCall);

    return () => {
      peerRef.current?.destroy();
      stopStream();
      stopScreenShare();
      socket.off('user-joined');
      socket.off('all-users');
      socket.off('user-left');
      socket.off('room-ended');
      socket.off('raise-hand');
      socket.off('lower-hand');
      socket.off('receive-message');
      window.removeEventListener('beforeunload', handleEndCall);
      if (isMobile) {
        window.removeEventListener('orientationchange', handleOrientationChange);
      }
    };
  }, [socket, user, courseId, isHost, isMobile]);

  const handleEndCall = () => {
    if (isHost) {
      socket.emit("end-call", { courseId });
    }
    stopStream();
    stopScreenShare();
    setCallEnded(true);
  };

  const toggleCamera = async () => {
    try {
      if (camera) {
        // Turn off camera
        stopStream();
        setCamera(false);
      } else {
        // Turn on camera (video only)
        const constraints = {
          video: getMobileConstraints().video, // Video constraints only
          audio: false // Explicitly disable audio
        };

        console.log("vansh")
        console.log(navigator)
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // Handle iOS specific quirks
        if (isMobile) {
          const videoTracks = stream.getVideoTracks();
          videoTracks.forEach(track => {
            track.onended = () => {
              setCamera(false);
              setCameraError('Camera was disconnected');
            };
          });
        }

        localStreamRef.current = stream;
        setCamera(true);
        setCameraError(null);

        // Connect to all existing participants with video only
        participants.forEach(({ peerId }) => {
          const call = peerRef.current.call(peerId, stream);
          call.on('stream', remoteStream => {
            setParticipants(prev => prev.map(p =>
              p.peerId === call.peer ? { ...p, stream: remoteStream } : p
            ));
          });
        });
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCamera(false);
      setCameraError(err.message);

      if (err.name === 'NotAllowedError') {
        alert('Please enable camera permissions in your browser settings');
      } else if (err.name === 'NotFoundError') {
        alert('No camera found on this device');
      } else {
        alert(`Could not access camera: ${err.message}`);
      }
    }
  };

  const toggleMic = async () => {
    try {
      if (localStreamRef.current) {
        // Toggle existing audio tracks
        const audioTracks = localStreamRef.current.getAudioTracks();
        if (audioTracks.length > 0) {
          const newMicState = !mic;
          audioTracks.forEach(track => (track.enabled = newMicState));
          setMic(newMicState);
        } else {
          // If no audio tracks exist (shouldn't happen if camera was on)
          console.warn("No audio tracks found - creating new audio stream");
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const newAudioTrack = audioStream.getAudioTracks()[0];
          localStreamRef.current.addTrack(newAudioTrack);
          setMic(true);

          // Update all existing calls with the new stream
          participants.forEach(({ peerId }) => {
            if (peerId !== peerRef.current?.id) {
              const call = peerRef.current.call(peerId, localStreamRef.current);
              call.on('stream', remoteStream => {
                setParticipants(prev => prev.map(p =>
                  p.peerId === call.peer ? { ...p, stream: remoteStream } : p
                ));
              });
            }
          });
        }
      } else {
        // If no stream exists at all, create one with just audio
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = audioStream;
        setMic(true);

        // Connect to all existing participants with audio only
        participants.forEach(({ peerId }) => {
          const call = peerRef.current.call(peerId, audioStream);
          call.on('stream', remoteStream => {
            setParticipants(prev => prev.map(p => p.peerId === call.peer ? { ...p, stream: remoteStream } : p));
          });
        });
      }
    } catch (error) {
      console.error("Error toggling microphone:", error);
      setMic(false);
      alert(`Could not access microphone: ${error.message}`);
    }
  };

  const renderVideo = (stream, muted = false) => (
    <video
      className="w-100 h-100 object-fit-cover rounded"
      autoPlay
      playsInline
      muted={muted}
      ref={video => {
        if (video && stream) video.srcObject = stream;
      }}
    />
  );

  const renderPlaceholder = (label, isYou = false) => (
    <div className={`w-100 h-100 d-flex flex-column justify-content-center align-items-center ${isYou ? 'bg-primary' : 'bg-secondary'} text-white rounded`}>
      <div className="initials-circle mb-2">
        {label.split(' ').map(n => n[0]).join('').toUpperCase()}
      </div>
      <h5>{label}</h5>
    </div>
  );

  const pinnedParticipant =
    pinned === 'local'
      ? { name: user.name, stream: screenStreamRef.current || localStreamRef.current }
      : participants.find(p => p.peerId === pinned);

  if (callEnded) {
    return (
      <div className="d-flex flex-column vh-100 justify-content-center align-items-center bg-dark text-light">
        <h1 className="mb-4">Call Ended</h1>
        <p className="mb-4">The meeting has ended</p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.href = '/'}
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="google-meet-container ">
      {cameraError && (
        <div className="error-alert alert alert-danger">
          <p>Camera Error: {cameraError}</p>
          <button className="btn btn-sm btn-light" onClick={startStream}>
            Retry
          </button>
        </div>
      )}
      <div className="main-content d-flex flex-column">
        <div className='m-0 p-0 d-flex video-main-view-p  w-100'>
          <div className="video-main-view rounded shadow d-flex ">
            {pinnedParticipant?.stream
              ? renderVideo(pinnedParticipant.stream, pinned === 'local')
              : renderPlaceholder(pinnedParticipant?.name || 'You', pinned === 'local')}
            <div className="video-label">
              <i className="bi bi-pin-angle-fill me-2" />
              {pinnedParticipant?.name || 'You'}
              {raisedHands.includes(pinnedParticipant?.userId) && (
                <span className="ms-2 hand-icon">✋</span>
              )}
            </div>
          </div>
          {(showParticipants || showChat) && (
            <div className="side-panel">
              {showParticipants && (
                <div className="participants-list">
                  <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
                    <h5>Participants ({participants.length + 1})</h5>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setShowParticipants(false)}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                  <div className="participant-item">
                    <div className="participant-avatar">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="participant-info">
                      <strong>{user.name}</strong> (You)
                    </div>
                    {isHost && <div className="participant-role">Host</div>}
                  </div>
                  {participants.map(p => (
                    <div key={p.peerId} className="participant-item">
                      <div className="participant-avatar">
                        {p.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className="participant-info">
                        <strong>{p.name}</strong>
                        {raisedHands.includes(p.userId) && (
                          <span className="ms-2 hand-icon">✋</span>
                        )}
                      </div>
                      {isHost && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            socket.emit('remove-participant', { courseId, userId: p.userId });
                          }}
                        >
                          <i className="bi bi-person-x"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {showChat && (
                <div className="chat-container">
                  <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
                    <h5>Chat</h5>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setShowChat(false)}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                  <div className="chat-messages">
                    {chatMessages.length === 0 ? (
                      <div className="text-center p-3 text-white">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      chatMessages.map((msg, index) => (
                        <div key={index} className={`message ${msg.isMe ? 'me' : ''}`}>
                          <div className="message-sender">{msg.sender}</div>
                          <div className="message-text">{msg.text}</div>
                          <div className="message-time">{msg.timestamp}</div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="chat-input">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      aria-label="Chat message input"
                    />
                    <button
                      onClick={sendMessage}
                      className="btn btn-primary"
                      aria-label="Send message"
                    >
                      <i className="bi bi-send-fill"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
          }
        </div>
        <div className="video-thumbnails">
          <div
            className={`video-tile position-relative ${pinned === 'local' ? 'pinned' : ''}`}
            onClick={() => setPinned('local')}
            role="button"
            aria-label="Pin your video"
          >
            {localStreamRef.current || screenStreamRef.current
              ? renderVideo(screenStreamRef.current || localStreamRef.current, true)
              : renderPlaceholder('You', true)}
            <span className="video-tile-label">You</span>
            {pinned === 'local' && <span className="pin-overlay m-0"><i className="bi bi-pin-fill" /></span>}
            {!camera && !screenShare && <div className="camera-off-overlay"><i className="bi bi-camera-video-off" /></div>}
            {!mic && <div className="mic-off-overlay"><i className="bi bi-mic-mute" /></div>}
          </div>
          {participants.map(p => (
            <div
              key={p.peerId}
              className={`video-tile position-relative ${pinned === p.peerId ? 'pinned' : ''}`}
              onClick={() => setPinned(p.peerId)}
              role="button"
              aria-label={`Pin ${p.name}'s video`}
            >
              <div className='overlay '>
                {pinned === p.peerId && <span className="pin-overlay"><i className="bi bi-pin-fill" /></span>}
                <span className="video-tile-label">{p.name}</span>
                <div className='d-flex justify-content-end w-100 gap-1 '>
                  {raisedHands.includes(p.userId) && (
                    <div className="hand-overlay ">✋</div>
                  )}
                  {!p.stream && <div className="camera-off-overlay"><i className="bi bi-camera-video-off" /></div>}
                </div>
              </div>
              {p.stream ? renderVideo(p.stream) : renderPlaceholder(p.name)}
            </div>
          ))}
        </div>
      </div>
      <div className="control-bar bg-dark text-light d-flex justify-content-between align-items-center py-2 px-3">
        <div className="meeting-info d-flex align-items-center">
          <span className="meeting-code">
            <i className="bi bi-shield-lock me-2"></i>
            <strong>{courseId}</strong>
          </span>
          {isHost && <span className="badge bg-primary ms-2">Host</span>}
          {isMobile && (
            <button
              className="btn btn-sm btn-outline-light ms-2"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Meeting link copied!');
              }}
            >
              <i className="bi bi-link-45deg"></i> Copy Link
            </button>
          )}
        </div>

        <div className="control-buttons d-flex gap-2">
          <button
            onClick={toggleMic}
            className={`btn mx-1 ${mic ? 'btn-light' : 'btn-danger'}`}
            title={mic ? 'Mute' : 'Unmute'}
            aria-label={mic ? 'Mute microphone' : 'Unmute microphone'}
          >
            <i className={`bi ${mic ? 'bi-mic-fill' : 'bi-mic-mute-fill'}`} />
          </button>

          <button
            onClick={toggleCamera}
            className={`btn mx-1 ${camera ? 'btn-light' : 'btn-danger'}`}
            title={camera ? 'Turn off camera' : 'Turn on camera'}
            aria-label={camera ? 'Turn off camera' : 'Turn on camera'}
          >
            <i className={`bi ${camera ? 'bi-camera-video-fill' : 'bi-camera-video-off-fill'}`} />
          </button>

          <button
            onClick={toggleScreenShare}
            className={`btn m-0  ${screenShare ? 'btn-success' : 'btn-light'}`}
            title={screenShare ? 'Stop sharing' : 'Share screen'}
            aria-label={screenShare ? 'Stop sharing screen' : 'Share screen'}
          >
            <i className={`bi ${screenShare ? 'bi-stop-fill' : 'bi-laptop'}`} />
          </button>

          <button
            onClick={raisedHands.includes(user._id) ? lowerHand : raiseHand}
            className={`btn mx-1 ${raisedHands.includes(user._id) ? 'btn-warning' : 'btn-light'}`}
            title={raisedHands.includes(user._id) ? 'Lower hand' : 'Raise hand'}
            aria-label={raisedHands.includes(user._id) ? 'Lower hand' : 'Raise hand'}
          >
            <i className="bi bi-hand-index" />
          </button>
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`btn mx-1 ${showParticipants ? 'btn-primary' : 'btn-light'}`}
            title="Participants"
            aria-label="Show participants"
          >
            <i className="bi bi-people-fill" />
            <span className="badge bg-secondary ms-1">{participants.length + 1}</span>
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className={`btn mx-1 ${showChat ? 'btn-primary' : 'btn-light'}`}
            title="Chat"
            aria-label="Show chat"
          >
            <i className="bi bi-chat-left-text-fill" />
            {chatMessages.length > 0 && (
              <span className="badge bg-secondary ms-1">{chatMessages.length}</span>
            )}
          </button>
          <button
            onClick={handleEndCall}
            className="btn btn-danger mx-1"
            title={isHost ? 'End call for all' : 'Leave call'}
            aria-label={isHost ? 'End call for all' : 'Leave call'}
          >
            <i className={`bi ${isHost ? 'bi-telephone-x-fill' : 'bi-telephone-outbound-fill'}`} />
            <span className="ms-1 d-none d-sm-inline">{isHost ? 'End' : 'Leave'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleMeetUI;