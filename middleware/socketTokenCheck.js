// middlewares/socketTokenCheck.js
import jwt from "jsonwebtoken";
import User from "../model/User.js";
import ApiError from "../utils/ApiError.js";

// Map to track all connected users and their socket IDs
const allUser = new Map();

const socketTokenCheck = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new ApiError(401, "Token is required for socket connection"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ApiError(401, "User not found or token invalid"));
    }

    // Attach user object to the socket for later use
    socket.user = user;

    // Store user's socket ID (could be used for direct messaging, etc.)
    allUser.set(user._id.toString(), socket.id);

    return next();
  } catch (err) {
    console.error("Socket authentication failed:", err.message);
    return next(new ApiError(401, "Authentication failed"));
  }
};

export { allUser }; // Export for use in server.js or room management
export default socketTokenCheck;
