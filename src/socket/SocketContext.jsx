import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';

const SOCKET_SERVER_URL = "http://192.168.29.73:3000"; // Change to your backend
const SocketContext = createContext();

export const SocketProvider = ({ children, courseId }) => {
  const [socket, setSocket] = useState(null);
  const { loggedIn, user } = useSelector((state) => state.user);

  useEffect(() => {
    let newSocket;
    console.log(loggedIn);

    if (loggedIn && user.token) {
      newSocket = io(SOCKET_SERVER_URL, {
        transports: ['websocket'],
        auth: {
          token: user.token
        }
      });

      setSocket(newSocket);

      // Debug
      console.log("Connecting to socket with:");

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }

    // Cleanup if logged out
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [loggedIn, user.token]);
  // Add to your socket initialization
  
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
