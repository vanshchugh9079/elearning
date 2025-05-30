import React from 'react';
import { motion } from 'framer-motion';

const ChatPanel = ({
  messages,
  message,
  setMessage,
  sendMessage,
  onBack
}) => {
  return (
    <div className="chat-tab w-100 h-100 bg-dark text-light d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
        <h4>Chat</h4>
        <button
          className="btn btn-sm btn-outline-light rounded-circle"
          onClick={onBack}
        >
          <i className="bi bi-arrow-left"></i>
        </button>
      </div>

      <div className="chat-messages flex-grow-1 p-3">
        {messages.length === 0 ? (
          <div className="text-center p-3 text-muted h-100 d-flex flex-column justify-content-center">
            <i className="bi bi-chat-square-text display-5 mb-3"></i>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <motion.div
              key={index}
              className={`message ${msg.isMe ? 'me' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
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
    </div>
  );
};

export default ChatPanel;