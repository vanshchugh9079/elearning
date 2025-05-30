import React, { useEffect, useState, useRef } from 'react';
import Peer from 'peerjs';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../socket/SocketContext';
import { useSelector } from 'react-redux';
import { api } from '../../utils/constant';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../../css/liveclass/liveClass.css';
import { motion, AnimatePresence } from 'framer-motion';

const GoogleMeetUI = () => {
  const socket = useSocket();
  const { user } = useSelector(state => state.user);
  const { id: courseId } = useParams();

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const chatContainerRef = useRef(null);
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
  const [activeTab, setActiveTab] = useState('main'); // 'main', 'participants', 'chat'
  const [isMobile, setIsMobile] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [activeControls, setActiveControls] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [notifications, setNotifications] = useState([]);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const controlsBarRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (controlsBarRef.current && !controlsBarRef.current.contains(event.target)) {
        setShowMobileControls(false);
      }
    };

    if (showMobileControls) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showMobileControls]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const addNotification = (message, type = 'info') => {
    setNotifications(prev => [...prev, { id: Date.now(), message, type }]);
  };

  const getMediaConstraints = () => {
    return {
      video: {
        facingMode: 'user',
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        frameRate: { ideal: 24, max: 30 },
        ...(isMobile && { facingMode: { exact: 'user' } })
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };
  };

  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch (err) {
      console.error("Error enumerating devices:", err);
      return false;
    }
  };

  const startStream = async () => {
    try {
      const hasCamera = await checkCameraAvailability();
      if (!hasCamera) {
        throw new Error('No camera detected on this device');
      }

      const constraints = getMediaConstraints();
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (isMobile) {
        const videoTracks = stream.getVideoTracks();
        videoTracks.forEach(track => {
          track.onended = () => {
            setCamera(false);
            setCameraError('Camera was disconnected');
            addNotification('Camera disconnected', 'error');
          };
        });
      }

      localStreamRef.current = stream;
      setCamera(true);
      setMic(true);
      setCameraError(null);
      addNotification('Camera and microphone activated');

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

      if (err.name === 'NotAllowedError') {
        addNotification('Please enable camera permissions in your browser settings', 'error');
      } else if (err.name === 'NotFoundError') {
        addNotification('No camera found on this device', 'error');
      } else {
        addNotification(`Could not access camera: ${err.message}`, 'error');
      }
    }
  };

  const stopStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setCamera(false);
      setMic(false);
      addNotification('Camera turned off');
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          frameRate: { ideal: 15, max: 24 }
        },
        audio: true,
        selfBrowserSurface: 'exclude',
        systemAudio: 'include'
      });

      screenStreamRef.current = stream;
      setScreenShare(true);
      addNotification('Screen sharing started');

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
      addNotification(`Could not share screen: ${err.message}`, 'error');
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
      setScreenShare(false);
      addNotification('Screen sharing stopped');

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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

        const peer = new Peer({
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' }
            ]
          }
        });
        peerRef.current = peer;

        peer.on('open', id => {
          setPeerId(id);
          if (youCreated) {
            socket.emit('create-room', { courseId, peerId: id });
            addNotification('Meeting room created');
          } else {
            socket.emit('join-room', { courseId, peerId: id });
            addNotification('Joined meeting');
          }
          setupCallListener();
        });

        peer.on('error', err => {
          console.error('PeerJS error:', err);
          addNotification(`Connection error: ${err.message}`, 'error');
        });

        const qualityInterval = setInterval(() => {
          const qualities = ['excellent', 'good', 'fair', 'poor'];
          setConnectionQuality(qualities[Math.floor(Math.random() * qualities.length)]);
        }, 10000);

        return () => clearInterval(qualityInterval);
      } catch (error) {
        console.error("Failed to fetch your courses:", error);
        addNotification('Failed to initialize meeting', 'error');
      }
    };

    init();

    if (isMobile) {
      window.addEventListener('orientationchange', handleOrientationChange);
    }

    socket.on('user-joined', newUser => {
      setParticipants(prev => {
        if (!prev.some(p => p.userId === newUser.userId)) {
          addNotification(`${newUser.name} joined the meeting`);
          return [...prev, newUser];
        }
        return prev;
      });

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
          addNotification(`Connection to ${newUser.name} failed`, 'error');
        });
      }
    });

    socket.on('all-users', users => {
      setParticipants(users.filter(u => u.userId !== user._id));
    });

    socket.on('user-left', ({ userId, name }) => {
      console.log(name)
      setParticipants(prev => prev.filter(p => p.userId !== userId));
      setRaisedHands(prev => prev.filter(id => id !== userId));
      addNotification(`${name} left the meeting`);
    });

    socket.on('room-ended', () => {
      setCallEnded(true);
      stopStream();
      stopScreenShare();
      addNotification('The meeting has ended', 'info');
    });

    socket.on('raise-hand', ({ userId, name }) => {
      setRaisedHands(prev => [...prev, userId]);
      if (userId !== user._id) {
        addNotification(`${name} raised their hand`);
      }
    });

    socket.on('lower-hand', ({ userId}) => {
      setRaisedHands(prev => prev.filter(id => id !== userId));
    });

    socket.on('receive-message', (message) => {
      setChatMessages(prev => [...prev, { ...message, isMe: false }]);
      if (activeTab !== 'chat') {
        addNotification(`New message from ${message.sender}`);
      }
    });

    socket.on('chat-history', (messages) => {
      setChatMessages(messages);
    });

    socket.on('raised-hands', (hands) => {
      setRaisedHands(hands);
    });

    socket.on('participant-removed', ({ name }) => {
      addNotification(`${name} was removed from the meeting`, 'warning');
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
      socket.off('participant-removed');
      window.removeEventListener('beforeunload', handleEndCall);
      if (isMobile) {
        window.removeEventListener('orientationchange', handleOrientationChange);
      }
    };
  }, [socket, user, courseId, isHost, isMobile, activeTab]);

  const handleEndCall = () => {
    if (isHost) {
      socket.emit("end-call", { courseId });
      addNotification('Meeting ended for all participants', 'info');
    } else {
      addNotification('You left the meeting', 'info');
    }
    stopStream();
    stopScreenShare();
    setCallEnded(true);
  };

  const toggleCamera = async () => {
    try {
      if (camera) {
        stopStream();
      } else {
        const constraints = {
          video: getMediaConstraints().video,
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (isMobile) {
          const videoTracks = stream.getVideoTracks();
          videoTracks.forEach(track => {
            track.onended = () => {
              setCamera(false);
              setCameraError('Camera was disconnected');
              addNotification('Camera disconnected', 'error');
            };
          });
        }

        localStreamRef.current = stream;
        setCamera(true);
        setCameraError(null);
        addNotification('Camera turned on');

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
        addNotification('Please enable camera permissions in your browser settings', 'error');
      } else if (err.name === 'NotFoundError') {
        addNotification('No camera found on this device', 'error');
      } else {
        addNotification(`Could not access camera: ${err.message}`, 'error');
      }
    }
  };

  const toggleMic = async () => {
    try {
      if (localStreamRef.current) {
        const audioTracks = localStreamRef.current.getAudioTracks();
        if (audioTracks.length > 0) {
          const newMicState = !mic;
          audioTracks.forEach(track => (track.enabled = newMicState));
          setMic(newMicState);
        } else {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const newAudioTrack = audioStream.getAudioTracks()[0];
          localStreamRef.current.addTrack(newAudioTrack);
          setMic(true);

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
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = audioStream;
        setMic(true);

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
      addNotification(`Could not access microphone: ${error.message}`, 'error');
    }
  };

  const renderVideo = (stream, muted = false) => (
    <motion.video
      className="w-100 h-100 object-fit-cover rounded"
      autoPlay
      playsInline
      muted={muted}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      ref={video => {
        if (video && stream) video.srcObject = stream;
      }}
    />
  );

  const renderPlaceholder = (label, isYou = false) => (
    <motion.div
      className={`w-100 h-100 d-flex flex-column justify-content-center align-items-center ${isYou ? 'bg-gradient-primary' : 'bg-gradient-secondary'} rounded overflow-hidden position-relative`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="position-absolute w-100 h-100"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        style={{
          background: isYou
            ? 'linear-gradient(135deg, rgba(138, 180, 248, 0.8), rgba(129, 201, 149, 0.8))'
            : 'linear-gradient(135deg, rgba(242, 139, 130, 0.8), rgba(253, 214, 99, 0.8))'
        }}
      />

      <motion.div
        className="initials-circle mb-3 position-relative z-1"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.5,
          delay: 0.2,
          type: 'spring',
          stiffness: 200,
          damping: 10
        }}
        style={{
          width: '4.5rem',
          height: '4.5rem',
          fontSize: '1.8rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          background: isYou
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
          color: isYou ? '#1a73e8' : '#d93025'
        }}
      >
        {label.split(' ').map(n => n[0]).join('').toUpperCase()}
      </motion.div>

      <motion.h5
        className="position-relative z-1 mb-0 text-center px-2"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        style={{
          fontWeight: 500,
          color: '#fff',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          maxWidth: '90%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {label}
        {isYou && (
          <motion.span
            className="d-block mt-1 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            style={{
              fontSize: '0.7rem',
              fontWeight: 400
            }}
          >
            (You)
          </motion.span>
        )}
      </motion.h5>

      <motion.div
        className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden z-0"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="position-absolute rounded-circle"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              background: 'rgba(255, 255, 255, 0.1)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: 'blur(10px)'
            }}
            animate={{
              x: [0, Math.random() * 40 - 20],
              y: [0, Math.random() * 40 - 20],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );

  const pinnedParticipant =
    pinned === 'local'
      ? { name: user.name, stream: screenStreamRef.current || localStreamRef.current }
      : participants.find(p => p.peerId === pinned);

  if (callEnded) {
    return (
      <motion.div
        className="d-flex flex-column vh-100 justify-content-center align-items-center bg-dark text-light"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <h1 className="mb-4 text-center">Meeting Ended</h1>
          <p className="mb-4 text-center">Thank you for participating!</p>
          <div className="d-flex justify-content-center">
            <motion.button
              className="btn btn-primary btn-lg"
              onClick={() => window.location.href = '/'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Return to Home
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const ControlButtons = React.memo(({
    mic, camera, screenShare, raisedHands, user, participants, chatMessages,
    isHost, toggleMic, toggleCamera, toggleScreenShare,
    raiseHand, lowerHand, handleEndCall, activeTab
  }) => {
    return (
      <>
        {
          activeTab == "main" &&
          <>
            <motion.button
              onClick={toggleMic}
              className={`btn rounded-pill ${mic ? 'btn-light' : 'btn-danger'}`}
              title={mic ? 'Mute' : 'Unmute'}
              aria-label={mic ? 'Mute microphone' : 'Unmute microphone'}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <i className={`bi ${mic ? 'bi-mic-fill' : 'bi-mic-mute-fill'}`} />
            </motion.button>

            <motion.button
              onClick={toggleCamera}
              className={`btn rounded-pill ${camera ? 'btn-light' : 'btn-danger'}`}
              title={camera ? 'Turn off camera' : 'Turn on camera'}
              aria-label={camera ? 'Turn off camera' : 'Turn on camera'}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <i className={`bi ${camera ? 'bi-camera-video-fill' : 'bi-camera-video-off-fill'}`} />
            </motion.button>

            <motion.button
              onClick={toggleScreenShare}
              className={`btn rounded-pill ${screenShare ? 'btn-success' : 'btn-light'}`}
              title={screenShare ? 'Stop sharing' : 'Share screen'}
              aria-label={screenShare ? 'Stop sharing screen' : 'Share screen'}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <i className={`bi ${screenShare ? 'bi-stop-fill' : 'bi-laptop'}`} />
            </motion.button>

            <motion.button
              onClick={raisedHands.includes(user._id) ? lowerHand : raiseHand}
              className={`btn rounded-pill ${raisedHands.includes(user._id) ? 'btn-warning' : 'btn-light'}`}
              title={raisedHands.includes(user._id) ? 'Lower hand' : 'Raise hand'}
              aria-label={raisedHands.includes(user._id) ? 'Lower hand' : 'Raise hand'}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <i className="bi bi-hand-index" />
              {raisedHands.includes(user._id) && (
                <motion.span
                  className="hand-animation"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('participants')}
              className={`btn rounded-pill ${activeTab === 'participants' ? 'btn-primary' : 'btn-light'}`}
              title="Participants"
              aria-label="Show participants"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <i className="bi bi-people-fill" />
              <span className="badge bg-secondary ms-1">{participants.length + 1}</span>
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('chat')}
              className={`btn rounded-pill ${activeTab === 'chat' ? 'btn-primary' : 'btn-light'}`}
              title="Chat"
              aria-label="Show chat"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <i className="bi bi-chat-left-text-fill" />
              {chatMessages.length > 0 && (
                <span className="badge bg-secondary ms-1">{chatMessages.length}</span>
              )}
            </motion.button>

            <motion.button
              onClick={handleEndCall}
              className="btn btn-danger rounded-pill"
              title={isHost ? 'End call for all' : 'Leave call'}
              aria-label={isHost ? 'End call for all' : 'Leave call'}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <i className={`bi ${isHost ? 'bi-telephone-x-fill' : 'bi-telephone-outbound-fill'}`} />
              <span className="ms-1 d-none d-sm-inline">{isHost ? '' : 'Leave'}</span>
            </motion.button>
          </>
        }
      </>
    );
  });

  return (
    <div className="google-meet-container position-fixed w-100 h-100 bg-dark">
      {/* Connection quality indicator */}
      <div className={`connection-quality ${connectionQuality}`}>
        <i className={`bi ${connectionQuality === 'excellent' ? 'bi-wifi' :
          connectionQuality === 'good' ? 'bi-wifi' :
            connectionQuality === 'fair' ? 'bi-wifi-2' : 'bi-wifi-1'}`} />
        <span>{connectionQuality}</span>
      </div>

      {/* Notifications */}
      <div className="notifications-container">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              className={`notification ${notification.type}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
            >
              {notification.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {cameraError && (
        <motion.div
          className="error-alert alert alert-danger"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p>Camera Error: {cameraError}</p>
          <button
            className="btn btn-sm btn-light"
            onClick={startStream}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry
          </button>
        </motion.div>
      )}

      <div className="main-content d-flex h-100">
        {/* Main content area with three tabs */}
        <div className='m-0 p-0 d-flex video-main-view-p w-100 position-relative'>
          {/* Meeting info for mobile */}
          <div className="meeting-info d-flex align-items-center d-lg-none d-inline-block position-absolute top-0 start-0 z-3">
            <span className="meeting-code">
              <i className="bi bi-shield-lock me-2"></i>
              <strong>{courseId}</strong>
            </span>
            {isMobile && (
              <motion.button
                className="btn btn-sm btn-outline-light ms-2"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  addNotification('Meeting link copied to clipboard');
                }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="bi bi-link-45deg"></i> Copy Link
              </motion.button>
            )}
          </div>

          {/* Main view tab */}
          {activeTab === 'main' && (
            <motion.div
              className="video-main-view rounded shadow d-flex w-100 h-100"
              layoutId="main-video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {pinnedParticipant?.stream
                ? renderVideo(pinnedParticipant.stream, pinned === 'local')
                : renderPlaceholder(pinnedParticipant?.name || 'You', pinned === 'local')}
              <div className="video-label">
                <i className="bi bi-pin-angle-fill me-2" />
                {pinnedParticipant?.name || 'You'}
                {raisedHands.includes(pinnedParticipant?.userId) && (
                  <motion.span
                    className="ms-2 hand-icon"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    ✋
                  </motion.span>
                )}
              </div>
            </motion.div>
          )}

          {/* Participants tab */}
          {activeTab === 'participants' && (
            <motion.div
              className="participants-tab w-100 h-100 bg-dark text-light p-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Participants ({participants.length + 1})</h4>
                <button
                  className="btn btn-sm btn-outline-light rounded-circle"
                  onClick={() => setActiveTab('main')}
                >
                  <i className="bi bi-arrow-left"></i>
                </button>
              </div>

              <div className="participants-list">
                <div className="participant-item host">
                  <div className="participant-avatar bg-primary">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="participant-info">
                    <strong>{user.name}</strong> (You)
                  </div>
                  {isHost && <div className="participant-role badge bg-primary">Host</div>}
                </div>

                {participants.map(p => (
                  <motion.div
                    key={p.peerId}
                    className="participant-item"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="participant-avatar">
                      {p.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="participant-info">
                      <strong>{p.name}</strong>
                      {raisedHands.includes(p.userId) && (
                        <motion.span
                          className="ms-2 hand-icon"
                          animate={{ y: [0, -2, 0] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          ✋
                        </motion.span>
                      )}
                    </div>
                    {isHost && (
                      <motion.button
                        className="btn btn-sm btn-outline-danger rounded-circle"
                        onClick={() => {
                          socket.emit('remove-participant', { courseId, userId: p.userId });
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <i className="bi bi-person-x"></i>
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Chat tab */}
          {activeTab === 'chat' && (
            <motion.div
              className="chat-tab w-100 h-100 bg-dark text-light d-flex flex-column"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <h4>Chat</h4>
                <button
                  className="btn btn-sm btn-outline-light rounded-circle"
                  onClick={() => setActiveTab('main')}
                >
                  <i className="bi bi-arrow-left"></i>
                </button>
              </div>

              <div className="chat-messages flex-grow-1 p-3" ref={chatContainerRef}>
                {chatMessages.length === 0 ? (
                  <div className="text-center p-3 text-muted h-100 d-flex flex-column justify-content-center">
                    <i className="bi bi-chat-square-text display-5 mb-3"></i>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  chatMessages.map((msg, index) => (
                    <motion.div
                    
                      key={index}
                      className={`message ${msg.isMe ? 'me' : ''}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {
                      console.log(msg)
                    }
                      <div className="message-sender">{msg.sender}{msg.isMe && ' (You)'}</div>
                      <div className="message-text">{msg.text}</div>
                      <div className="message-time">{msg.timestamp}</div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="chat-input p-3">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    aria-label="Chat message input"
                  />
                  <motion.button
                    onClick={sendMessage}
                    className="btn btn-primary"
                    aria-label="Send message"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!message.trim()}
                  >
                    <i className="bi bi-send-fill"></i>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Participant thumbnails - only show on desktop */}
        {!isMobile && activeTab === 'main' && (
          <div className="video-thumbnails d-none d-lg-flex">
            <motion.div
              className={`video-tile position-relative ${pinned === 'local' ? 'pinned' : ''}`}
              onClick={() => setPinned('local')}
              role="button"
              aria-label="Pin your video"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              layoutId="local-video"
            >
              {localStreamRef.current || screenStreamRef.current
                ? renderVideo(screenStreamRef.current || localStreamRef.current, true)
                : renderPlaceholder('You', true)}
              <span className="video-tile-label">You</span>
              {pinned === 'local' && <span className="pin-overlay m-0"><i className="bi bi-pin-fill" /></span>}
              {!camera && !screenShare && <div className="camera-off-overlay"><i className="bi bi-camera-video-off" /></div>}
              {!mic && <div className="mic-off-overlay"><i className="bi bi-mic-mute" /></div>}
            </motion.div>

            {participants.map(p => (
              <motion.div
                key={p.peerId}
                className={`video-tile position-relative ${pinned === p.peerId ? 'pinned' : ''}`}
                onClick={() => setPinned(p.peerId)}
                role="button"
                aria-label={`Pin ${p.name}'s video`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                layoutId={`participant-${p.peerId}`}
              >
                <div className='overlay'>
                  {pinned === p.peerId && <span className="pin-overlay"><i className="bi bi-pin-fill" /></span>}
                  <span className="video-tile-label">{p.name}</span>
                  <div className='d-flex justify-content-end w-100 gap-1'>
                    {raisedHands.includes(p.userId) && (
                      <motion.div
                        className="hand-overlay"
                        animate={{ y: [0, -2, 0] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        ✋
                      </motion.div>
                    )}
                    {!p.stream && <div className="camera-off-overlay"><i className="bi bi-camera-video-off" /></div>}
                  </div>
                </div>
                {p.stream ? renderVideo(p.stream) : renderPlaceholder(p.name)}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile controls toggle button */}
      {isMobile && !showMobileControls && (
        <motion.button
          className="mobile-controls-toggle btn btn-primary rounded-circle"
          onClick={() => setShowMobileControls(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <i className="bi bi-three-dots-vertical"></i>
        </motion.button>
      )}

      {/* Control bar with animations */}
      <AnimatePresence>
        {(activeControls || showMobileControls) && (
          <motion.div
            ref={controlsBarRef}
            className={`control-bar bg-dark text-light d-flex justify-content-between align-items-center py-2 px-3 ${isMobile ? 'mobile-controls' : ''
              }`}
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {!isMobile && (
              <div className="meeting-info d-flex align-items-center">
                <span className="meeting-code">
                  <i className="bi bi-shield-lock me-2"></i>
                  <strong>{courseId}</strong>
                </span>
                {isHost && <span className="badge bg-primary ms-2">Host</span>}
              </div>
            )}

            <div className="control-buttons d-flex gap-2">
              <ControlButtons
                mic={mic}
                camera={camera}
                screenShare={screenShare}
                raisedHands={raisedHands}
                user={user}
                participants={participants}
                chatMessages={chatMessages}
                isHost={isHost}
                toggleMic={toggleMic}
                toggleCamera={toggleCamera}
                toggleScreenShare={toggleScreenShare}
                raiseHand={raiseHand}
                lowerHand={lowerHand}
                handleEndCall={handleEndCall}
                activeTab={activeTab}
              />
            </div>

            {isMobile && (
              <button
                className="btn btn-outline-secondary rounded-circle ms-2"
                onClick={() => setShowMobileControls(false)}
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
};
export default GoogleMeetUI