import { io } from "socket.io-client";
// https://elearning-ndyp.onrender.com
export const socket = io("https://elearning-ndyp.onrender.com", {
  transports: ["websocket"], // Ensure WebSocket transport is enabled
  withCredentials:true,
  autoConnect:false
});
 
