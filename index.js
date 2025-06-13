import app from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB connected successfully");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Function to find an available port
const findAvailablePort = async (startPort) => {
  const net = await import("net");
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });
  });
};

// Start server
const startServer = async () => {
  try {
    // Connect to database if URI is provided
    if (process.env.MONGODB_URI) {
      await connectDB();
    }

    // Find an available port
    const desiredPort = parseInt(process.env.PORT) || 3000;
    const port = await findAvailablePort(desiredPort);

    // Start HTTP server
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

      // If the port is different from desired, show a message
      if (port !== desiredPort) {
        console.log(
          `Note: Port ${desiredPort} was in use, using port ${port} instead`
        );
      }
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle process termination
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

// Start the server
startServer();
