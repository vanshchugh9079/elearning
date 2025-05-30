import React from 'react';
import { motion } from 'framer-motion';

const ErrorAlert = ({ message, onRetry }) => {
  return (
    <motion.div
      className="error-alert alert alert-danger"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p>Camera Error: {message}</p>
      <button
        className="btn btn-sm btn-light"
        onClick={onRetry}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Retry
      </button>
    </motion.div>
  );
};

export default ErrorAlert;