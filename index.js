import dotenv from "dotenv";
import http from "http";
import events from "events";
import app from "./src/app.js";

// Increase max listeners to prevent warning
events.setMaxListeners(15);
// or for the global EventEmitter default
events.defaultMaxListeners = 15;

dotenv.config();

const PORT = process.env.PORT ;

const server = http.createServer(app);

const startServer = () => {
    try{
        server.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV } mode on port ${PORT}`);
            if (process.env.BACKEND_URL) {
                console.log(`Server running on ${process.env.BACKEND_URL}`);
            }
        });
    } catch (error){
        console.error("Error starting the server:", error);
        process.exit(1);
    }
}

startServer();

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    process.exit(1);
});
