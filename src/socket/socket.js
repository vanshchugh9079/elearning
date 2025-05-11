import { io } from "socket.io-client";

export const socket = io("https://elearning-ndyp.onrender.com", {
  transports: ["websocket"], // Ensure WebSocket transport is enabled
});
