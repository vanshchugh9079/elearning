import React from 'react';
import { motion } from 'framer-motion';

const MeetingEnded = () => {
  return (
    <div className="d-flex flex-column vh-100 justify-content-center align-items-center bg-dark text-light">
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
    </div>
  );
};

export default MeetingEnded;