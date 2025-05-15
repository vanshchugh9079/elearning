import { io } from "socket.io-client";
// https://elearning-ndyp.onrender.com
export const socket = io("http://192.168.29.73:3000", {
  transports: ["websocket"], // Ensure WebSocket transport is enabled
  withCredentials:true,
  autoConnect:false
});
 