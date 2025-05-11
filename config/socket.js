import { Server } from "socket.io";
import socketTokenCheck from "../middleware/socketTokenCheck.js";
import registerSocketHandlers from "../socket/handler.js";

export const rooms = {}; // Exported to allow sharing across modules

const initializeSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Replace in production
      methods: ["GET", "POST"],
    },
  });

  io.use(socketTokenCheck);
  io.on("connection", (socket) => {
    console.log(socket.user.name + " connected suusccessfully" );
    
    registerSocketHandlers(io, socket);
  });
};

export default initializeSocketServer;
