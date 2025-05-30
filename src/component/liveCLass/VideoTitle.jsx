import React from 'react';
import { motion } from 'framer-motion';

const VideoTile = ({
  stream,
  name,
  isYou = false,
  isPinned = false,
  hasRaisedHand = false,
  showCameraOff = false,
  showMicOff = false,
  onClick
}) => {
  const renderVideo = () => (
    <motion.video
      className="w-100 h-100 object-fit-cover rounded"
      autoPlay
      playsInline
      muted={isYou}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      ref={video => {
        if (video && stream) video.srcObject = stream;
      }}
    />
  );

  const renderPlaceholder = () => (
    <motion.div
      className={`w-100 h-100 d-flex flex-column justify-content-center align-items-center ${isYou ? 'bg-gradient-primary' : 'bg-gradient-secondary'} rounded overflow-hidden position-relative`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Placeholder content */}
    </motion.div>
  );

  return (
    <motion.div
      className={`video-tile position-relative ${isPinned ? 'pinned' : ''}`}
      onClick={onClick}
      role="button"
      aria-label={`Pin ${name}'s video`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      layoutId={`video-${name}`}
    >
      {stream ? renderVideo() : renderPlaceholder()}
      
      <div className="video-tile-label">
        {name}
        {isYou && ' (You)'}
      </div>
      
      {isPinned && <span className="pin-overlay"><i className="bi bi-pin-fill" /></span>}
      {showCameraOff && <div className="camera-off-overlay"><i className="bi bi-camera-video-off" /></div>}
      {showMicOff && <div className="mic-off-overlay"><i className="bi bi-mic-mute" /></div>}
      {hasRaisedHand && (
        <motion.span
          className="hand-icon"
          animate={{ y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          ✋
        </motion.span>
      )}
    </motion.div>
  );
};

export default VideoTile;