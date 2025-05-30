import Course from '../model/Course.js';
import User from '../model/User.js';

const rooms = {};
const raisedHands = {};
const chats = {};

const registerSocketHandler = (io, socket) => {
  const user = socket.user;

  socket.on("create-room", async ({ courseId, peerId }) => {
    try {
      const course = await Course.findById(courseId);
      if (!course) return socket.emit("error", { message: "Course not found" });

      if (course.liveStatus === "live") {
        return socket.emit("error", { message: "Class is already live" });
      }

      const subscribers = await User.find({ subscription: courseId });

      course.liveStatus = "live";
      await course.save();

      rooms[courseId] = {
        createdBy: user._id.toString(),
        users: [{
          socketId: socket.id,
          peerId,
          userId: user._id.toString(),
          name: user.name,
          email: user.email
        }]
      };

      raisedHands[courseId] = [];
      chats[courseId] = [];

      socket.join(courseId);

      subscribers.forEach(sub => {
        io.to(sub._id.toString()).emit("live-class-started", course);
      });

      io.to(courseId).emit("all-users", rooms[courseId].users);
      io.to(courseId).emit("raised-hands", raisedHands[courseId]);
      io.to(courseId).emit("chat-history", chats[courseId]);

    } catch (err) {
      console.error("create-room error:", err);
      socket.emit("error", { message: "Internal server error" });
    }
  });

  socket.on("join-room", async ({ courseId, peerId }) => {
    try {
      const course = await Course.findById(courseId);
      if (!course) return socket.emit("error", { message: "Course not found" });

      if (course.liveStatus !== "live") {
        return socket.emit("error", { message: "Live class is not started" });
      }

      if (!rooms[courseId]) {
        rooms[courseId] = {
          createdBy: course.createdBy.toString(),
          users: []
        };
      }

      const existingUserIndex = rooms[courseId].users.findIndex(u => u.userId === user._id.toString());
      
      if (existingUserIndex !== -1) {
        // Update existing user's connection info
        rooms[courseId].users[existingUserIndex] = {
          ...rooms[courseId].users[existingUserIndex],
          socketId: socket.id,
          peerId
        };
      } else {
        // Add new user
        const newUser = {
          socketId: socket.id,
          peerId,
          userId: user._id.toString(),
          name: user.name,
          email: user.email
        };
        rooms[courseId].users.push(newUser);
      }

      socket.join(courseId);

      // Notify all users in the room about the updated participant list
      io.to(courseId).emit("all-users", rooms[courseId].users);
      
      // Send current state to the joining user
      socket.emit("raised-hands", raisedHands[courseId] || []);
      socket.emit("chat-history", chats[courseId] || []);

      // Only emit user-joined for new users
      if (existingUserIndex === -1) {
        socket.to(courseId).emit("user-joined", rooms[courseId].users.find(u => u.userId === user._id.toString()));
      }

    } catch (err) {
      console.error("join-room error:", err);
      socket.emit("error", { message: "Internal server error" });
    }
  });

  socket.on("raise-hand", ({ courseId, userId, name }) => {
    if (!raisedHands[courseId]) {
      raisedHands[courseId] = [];
    }
    
    if (!raisedHands[courseId].includes(userId)) {
      raisedHands[courseId].push(userId);
      io.to(courseId).emit("raise-hand", { userId, name });
      
      // Notify host specifically
      const room = rooms[courseId];
      if (room) {
        const host = room.users.find(u => u.userId === room.createdBy);
        if (host) {
          io.to(host.socketId).emit("host-notification", {
            message: `${name} raised their hand`,
            type: "hand-raise"
          });
        }
      }
    }
  });

  socket.on("lower-hand", ({ courseId, userId }) => {
    if (raisedHands[courseId]) {
      raisedHands[courseId] = raisedHands[courseId].filter(id => id !== userId);
      io.to(courseId).emit("lower-hand", { userId });
    }
  });

  socket.on("send-message", ({ courseId, message }) => {
    if (!chats[courseId]) {
      chats[courseId] = [];
    }
    
    const fullMessage = {
      ...message,user,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    chats[courseId].push(fullMessage);
    io.to(courseId).emit("receive-message", fullMessage);
  });
  socket.on("disconnect", async () => {
    try {
      for (const courseId in rooms) {
        const room = rooms[courseId];
        const index = room.users.findIndex(u => u.socketId === socket.id);

        if (index !== -1) {
          const userLeft = room.users[index];
          
          // Remove user from room
          room.users.splice(index, 1);

          // Notify others
          io.to(courseId).emit("user-left", {
            socketId: socket.id,
            userId: userLeft.userId,
            name: userLeft.name,
          });

          // Remove raised hand if present
          if (raisedHands[courseId]) {
            raisedHands[courseId] = raisedHands[courseId].filter(id => id !== userLeft.userId);
            io.to(courseId).emit("lower-hand", { userId: userLeft.userId });
          }

          // Host disconnected - end room
          if (room.createdBy === userLeft.userId && room.users.length === 0) {
            await Course.findByIdAndUpdate(courseId, { liveStatus: "ended" });
            io.to(courseId).emit("room-ended", {
              message: "Class ended because the host disconnected",
            });
            delete rooms[courseId];
            delete raisedHands[courseId];
            delete chats[courseId];
          }

          // Update participant list for remaining users
          if (room.users.length > 0) {
            io.to(courseId).emit("all-users", room.users);
          }

          break;
        }
      }
    } catch (err) {
      console.error("disconnect error:", err);
    }
  });

  socket.on("end-call", async ({ courseId }) => {
    try {
      await Course.findByIdAndUpdate(courseId, { liveStatus: "ended" });
      io.to(courseId).emit("room-ended", { message: "Class ended by host" });
      delete rooms[courseId];
      delete raisedHands[courseId];
      delete chats[courseId];
    } catch (err) {
      console.error("end-call error:", err);
    }
  });
};

export default registerSocketHandler;