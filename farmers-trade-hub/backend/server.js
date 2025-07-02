// Backend/server.js
const dotenv = require("dotenv");
const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const PORT = process.env.PORT || 5000;

// 1. Create HTTP server from Express app
const server = http.createServer(app);

// 2. Setup Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*", // for dev; restrict in production
    methods: ["GET", "POST"],
  },
});

// 3. Socket.IO logic
io.on("connection", (socket) => {
  console.log("🟢 New user connected:", socket.id);

  socket.on("place_bid", (bidData) => {
    console.log("📨 New bid received");

    // Broadcast bid to all clients
    io.emit("new_bid", bidData);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// 4. Attach io to app if needed in routes
app.set("io", io);

// 5. Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
