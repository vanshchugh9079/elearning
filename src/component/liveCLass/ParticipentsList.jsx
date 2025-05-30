import React from 'react';
import { motion } from 'framer-motion';

const ParticipantList = ({
  participants,
  user,
  raisedHands,
  isHost,
  onRemoveParticipant,
  onBack
}) => {
  return (
    <div className="participants-tab w-100 h-100 bg-dark text-light p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Participants ({participants.length + 1})</h4>
        <button
          className="btn btn-sm btn-outline-light rounded-circle"
          onClick={onBack}
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
                onClick={() => onRemoveParticipant(p.userId)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <i className="bi bi-person-x"></i>
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantList;