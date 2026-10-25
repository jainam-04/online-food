const dns = require('dns');
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require('express');
const http = require('http');
const app = express();
const { initSocket } = require('./utils/socket');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const menuRoutes = require('./routes/menuRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cateringRoutes = require('./routes/cateringRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
require('dotenv').config();
const cors = require('cors');

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

app.use(cors({
  origin: function(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true
}));
const mongoose = require('mongoose');

// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));

app.use("/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/catering", cateringRoutes);
app.use("/api/suggestions", suggestionRoutes);
app.use("/api/reviews", reviewRoutes);

app.use(errorMiddleware);

const port = process.env.PORT || 5000;

// Wrap express in a plain http server so Socket.IO can share the
// same port for real-time (WebSocket) traffic.
const server = http.createServer(app);
initSocket(server);

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log("Database connected");

    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      console.log(`Socket.IO is listening for real-time connections`);
    });
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
}

startServer();
