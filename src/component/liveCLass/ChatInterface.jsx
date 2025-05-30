import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInterface = ({ 
  messages, 
  typingUsers, 
  message, 
  setMessage, 
  onSendMessage, 
  onBack,
  inputRef
}) => {
  return (
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

      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div
            className="typing-indicators px-3 pb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {typingUsers.map(user => (
              <div key={user.userId} className="typing-indicator">
                {user.name} is typing...
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="chat-input p-3">
        <div className="input-group">
          <input
            ref={inputRef}
            type="text"
            className="form-control"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Type a message..."
            aria-label="Chat message input"
          />
          <motion.button
            onClick={onSendMessage}
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
  );
};

export default ChatInterface;