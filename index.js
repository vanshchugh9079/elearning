import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import dbConnect from "./database/dbConnect.js";
import initializeSocketServer from "./config/socket.js";

const server = http.createServer(app);

// Initialize socket server
initializeSocketServer(server);

// Start HTTP + WebSocket server
server.listen(process.env.PORT || 5000, async () => {
  await dbConnect();
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
});
