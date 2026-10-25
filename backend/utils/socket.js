// utils/socket.js
//
// Central place to initialize Socket.IO and hand out the `io` instance
// to controllers, without creating circular requires with index.js.

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

let io = null;

function initSocket(httpServer) {
  const allowedOrigins = [
    "http://localhost:5000",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5500",
    "http://127.0.0.1:5173"
  ];

  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
  }
  if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ""));
  }

  const isOriginAllowed = (origin) => {
    if (!origin || origin === "null") return true;
    if (allowedOrigins.includes(origin)) return true;
    if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) return true;
    if (origin.endsWith(".vercel.app") || origin.includes("vercel.app")) return true;
    return false;
  };

  io = new Server(httpServer, {
    cors: {
      origin: function (origin, callback) {
        if (isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Not allowed by CORS: ${origin}`));
        }
      },
      credentials: true,
    },
  });

  // Authenticate the socket using the same JWT used for REST calls.
  // Client sends it as: io(URL, { auth: { token } })
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        // Allow anonymous connections (e.g. a public "live orders" board),
        // they just won't be joined to any private room.
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret");
      const user = await User.findById(decoded.id).select("-password");

      socket.user = user || null;
      next();
    } catch (error) {
      // Bad/expired token: still let the socket connect anonymously
      // instead of hard-failing the handshake.
      socket.user = null;
      next();
    }
  });

  io.on("connection", (socket) => {
    if (socket.user) {
      // Personal room so a specific customer can be notified about
      // their own order without broadcasting to everyone.
      socket.join(`user_${socket.user._id}`);

      const isAdmin = Boolean(socket.user.isAdmin || socket.user.role === "admin");
      if (isAdmin) {
        socket.join("admins");
      }
    }

    socket.on("disconnect", () => {
      // no-op, rooms are cleaned up automatically
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call initSocket(server) first.");
  }
  return io;
}

module.exports = { initSocket, getIO };
