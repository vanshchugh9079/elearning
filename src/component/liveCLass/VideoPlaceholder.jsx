import React from 'react';
import { motion } from 'framer-motion';

const VideoPlaceholder = ({ name, isYou }) => {
  return (
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
        {name.split(' ').map(n => n[0]).join('').toUpperCase()}
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
        {name}
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
    </motion.div>
  );
};

export default VideoPlaceholder;