import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = ({ notifications }) => {
  return (
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
  );
};

export default Notifications;