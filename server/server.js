const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const fileRoutes = require("./routes/fileRoutes");
const codeRoutes = require("./routes/codeRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/code", codeRoutes);

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const roomUsers = {}; // roomId -> [{ id, username }]

// Socket logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("send-reaction", (data) => {
    io.to(data.roomId).emit("receive-reaction", {
      emoji: data.emoji,
      username: data.username
    });
  });

  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);
    socket.roomId = roomId;

    if (!roomUsers[roomId]) {
      roomUsers[roomId] = [];
    }

    // Remove old entry of same socket if exists
    roomUsers[roomId] = roomUsers[roomId].filter(
      (user) => user.id !== socket.id
    );

    roomUsers[roomId].push({
      id: socket.id,
      username
    });

    io.to(roomId).emit("participants-update", roomUsers[roomId]);
  });

  // Chat message
  socket.on("send-message", ({ roomId, message, username }) => {
    io.to(roomId).emit("receive-message", {
      username,
      message
    });
  });

  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-update", code);
  });

  socket.on("whiteboard-update", ({ roomId, lines }) => {
    socket.to(roomId).emit("whiteboard-sync", lines);
  });

  // --- WebRTC signaling (broadcast style, matches 1:1 call) ---
  socket.on("user-ready", (roomId) => {
    socket.to(roomId).emit("user-ready");
  });

  socket.on("video-offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("video-offer", offer);
  });

  socket.on("video-answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("video-answer", answer);
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  // --- Screen share lock/broadcast ---
  // broadcast to everyone else in the room so the share appears
  // automatically and others get locked out of sharing
  socket.on("screen-share-started", ({ roomId, userId }) => {
    socket.to(roomId).emit("screen-share-started", { userId });
  });

  socket.on("screen-share-stopped", ({ roomId, userId }) => {
    socket.to(roomId).emit("screen-share-stopped", { userId });
  });

  socket.on("disconnect", () => {
    for (const roomId in roomUsers) {
      roomUsers[roomId] = roomUsers[roomId].filter(
        (user) => user.id !== socket.id
      );

      io.to(roomId).emit("participants-update", roomUsers[roomId]);
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
