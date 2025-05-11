// registerSocketHandler.js
import Course from "../model/Course.js";
import User from "../model/User.js";

const rooms = {};              // courseId => array of socket IDs
const allUser = new Map();     // userId => socket ID
const roomUsers = {};          // courseId => array of { socketId, userId, name, micOn, videoOn }

const registerSocketHandler = (io, socket) => {
  const user = socket.user;

  socket.on("create-room", async ({ courseId }) => {
    try {
      const course = await Course.findById(courseId);
      if (!course) return socket.emit("error", "Course not found");

      const isCreator = course.createdBy.toString() === user._id.toString();
      if (!isCreator) return socket.emit("error", "Only the instructor can start the class");

      if (course.liveStatus === "live") {
        return socket.emit("error", "Class already live");
      }

      course.liveStatus = "live";
      await course.save();

      if (!rooms[courseId]) rooms[courseId] = [];
      if (!roomUsers[courseId]) roomUsers[courseId] = [];

      const subscribedUsers = await User.find({ subscription: courseId });
      for (const subscribedUser of subscribedUsers) {
        const subscribedSocketId = allUser.get(subscribedUser._id.toString());
        if (subscribedSocketId) {
          socket.to(subscribedSocketId).emit("live-class-started", {
            courseId,
            courseTitle: course.name,
            message: `Live class has started for course: ${course.name}`,
          });
        }
      }

      socket.join(courseId);
      rooms[courseId].push(socket.id);
      roomUsers[courseId].push({
        socketId: socket.id,
        userId: user._id,
        name: user.name,
        micOn: true,
        videoOn: true,
      });

      const otherUsers = roomUsers[courseId].filter(u => u.socketId !== socket.id);
      socket.emit("already-joined-users", { users: otherUsers });

      socket.to(courseId).emit("user-joined", {
        socketId: socket.id,
        userId: user._id,
        name: user.name,
        micOn: true,
        videoOn: true,
      });

      allUser.set(user._id.toString(), socket.id);
    } catch (err) {
      console.error(err);
      socket.emit("error", "Internal server error");
    }
  });

  socket.on("join-room", async ({ courseId }) => {
    try {
      const course = await Course.findById(courseId);
      if (!course) return socket.emit("error", "Course not found");

      if (course.liveStatus !== "live") {
        return socket.emit("error", "Class is not live right now");
      }

      const isSubscribed = user.subscription?.some(sub => sub.toString() === courseId);
      if (!isSubscribed) return socket.emit("error", "Not subscribed to course");

      socket.join(courseId);
      rooms[courseId] = rooms[courseId] || [];
      roomUsers[courseId] = roomUsers[courseId] || [];

      rooms[courseId].push(socket.id);
      roomUsers[courseId].push({
        socketId: socket.id,
        userId: user._id,
        name: user.name,
        micOn: true,
        videoOn: true,
      });

      const otherUsers = roomUsers[courseId].filter(u => u.socketId !== socket.id);
      socket.emit("already-joined-users", { users: otherUsers });

      socket.to(courseId).emit("user-joined", {
        socketId: socket.id,
        userId: user._id,
        name: user.name,
        micOn: true,
        videoOn: true,
      });

      allUser.set(user._id.toString(), socket.id);
    } catch (err) {
      console.error(err);
      socket.emit("error", "Internal server error");
    }
  });

  // WebRTC signaling handlers
  socket.on("offer", ({ courseId, targetUserId, offer }) => {
    const targetSocketId = allUser.get(targetUserId);
    if (targetSocketId) {
      socket.to(targetSocketId).emit("offer", {
        userId: user._id,
        offer,
      });
    }
  });

  socket.on("answer", ({ courseId, targetUserId, answer }) => {
    const targetSocketId = allUser.get(targetUserId);
    if (targetSocketId) {
      socket.to(targetSocketId).emit("answer", {
        userId: user._id,
        answer,
      });
    }
  });

  socket.on("ice-candidate", ({ courseId, targetUserId, candidate }) => {
    const targetSocketId = allUser.get(targetUserId);
    if (targetSocketId) {
      socket.to(targetSocketId).emit("ice-candidate", {
        userId: user._id,
        candidate,
      });
    }
  });

  socket.on("stream-status", ({ courseId, userId, hasVideo, hasAudio }) => {
    const userList = roomUsers[courseId];
    if (!userList) return;

    const targetUser = userList.find(u => u.userId.toString() === userId.toString());
    if (targetUser) {
      targetUser.videoOn = hasVideo;
      targetUser.micOn = hasAudio;

      io.to(courseId).emit("stream-status", {
        userId,
        hasVideo,
        hasAudio
      });
    }
  });

  socket.on("raise-hand", ({ courseId, userId }) => {
    socket.to(courseId).emit("hand-raised", { userId });
  });

  socket.on("leave-room", ({ courseId, userId }) => {
    if (rooms[courseId]) {
      rooms[courseId] = rooms[courseId].filter(id => id !== socket.id);
    }
    if (roomUsers[courseId]) {
      roomUsers[courseId] = roomUsers[courseId].filter(u => u.socketId !== socket.id);
    }

    socket.to(courseId).emit("user-left", {
      socketId: socket.id,
      userId,
      name: user.name,
    });
    socket.leave(courseId);
  });

  socket.on("end-room", async ({ courseId }) => {
    try {
      const course = await Course.findById(courseId);
      if (!course) return;

      if (course.createdBy.toString() !== user._id.toString()) {
        return socket.emit("error", "Only the instructor can end the class");
      }

      course.liveStatus = "ended";
      await course.save();

      io.to(courseId).emit("room-ended", { message: "Class ended by instructor." });

      rooms[courseId] = [];
      roomUsers[courseId] = [];
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("disconnect", async () => {
    try {
      for (const courseId in rooms) {
        const index = rooms[courseId].indexOf(socket.id);
        if (index !== -1) {
          rooms[courseId].splice(index, 1);
          roomUsers[courseId] = roomUsers[courseId]?.filter(u => u.socketId !== socket.id);

          const course = await Course.findById(courseId);
          if (course && course.createdBy.toString() === user._id.toString()) {
            course.liveStatus = "ended";
            await course.save();

            io.to(courseId).emit("room-ended", {
              courseId,
              message: "Class ended because the instructor disconnected.",
            });

            rooms[courseId] = [];
            roomUsers[courseId] = [];
          } else {
            socket.to(courseId).emit("user-left", {
              socketId: socket.id,
              userId: user._id,
              name: user.name,
            });
          }
        }
      }

      allUser.delete(user._id.toString());
      console.log(`${user.name} (${user._id}) disconnected.`);
    } catch (err) {
      console.error("Error on disconnect:", err);
    }
  });
};

export default registerSocketHandler;
