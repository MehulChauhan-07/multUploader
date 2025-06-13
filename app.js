import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import * as dotenv from "dotenv";
import events from "events";
import fileRoutes from "./routes/fileRoutes.js";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import rateLimit from "express-rate-limit";

// Increase max listeners to prevent warning
events.defaultMaxListeners = 15;

// Load environment variables
dotenv.config();

const app = express();

// Get equivalent of __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "cdn.jsdelivr.net",
          "cdnjs.cloudflare.com",
        ],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "cdn.jsdelivr.net",
          "cdnjs.cloudflare.com",
          "fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "fonts.gstatic.com", "cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Configure body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Configure view engine and layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files - make sure these come before routes
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));
app.use("/public", express.static(path.join(__dirname, "./public")));
app.use(express.static(path.join(__dirname, "./public")));

// Favicon route
app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "./public", "favicon.ico"));
});

// Root route redirect
app.get("/", (req, res) => {
  res.redirect("/upload");
});

// API routes
app.use("/api", fileRoutes);

// Page routes
app.use("/", fileRoutes);

// Add 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).render("error", {
    title: "Page Not Found",
    message: `The page you're looking for doesn't exist.`,
    error: { status: 404 },
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render("error", {
    title: "Error",
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});
//
// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

export default app;
