
import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import * as dotenv from "dotenv";
import events from "events";
import upload from "./routes/upload.js";
// Increase max listeners to prevent warning
events.defaultMaxListeners = 15;

const app = express();

// Get equivalent of __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//
// // Load environment variables
// const envFile = process.env.USE_DEVTUNNEL === 'true' ? '.env.local' : '.env';
// dotenv.config({ path: path.resolve(__dirname, `../../${envFile}`) });

// app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//routes
// app.use("/", (req, res) => {
//     // res.json({
//     //     status: "success",
//     //     message: "Welcome to the File Upload API",
//     //     version: "1.0.0",
//     // });
//     return res.status(200).render("home");
// });

// app.use("/api", upload);
app.use("/", upload);

// Add 404 handler for undefined routes
app.use((req, res, next) => {
    res.status(404).json({
        status: "error, Page not found",
        message: `Route ${ process.env.BACKEND_URL}/${req.originalUrl} not found`,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        status: "error",
        message: err.message || "Internal Server Error",
    });
});


export default app;

