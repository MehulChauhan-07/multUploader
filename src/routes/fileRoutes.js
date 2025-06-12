import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import sharp from "sharp";
import mime from "mime-types";
import fileController from "../controllers/fileController.js";
import upload from "../config/multer.js";

const router = express.Router();

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure upload directory
const uploadDir = path.join(__dirname, "../../uploads");
const thumbnailDir = path.join(uploadDir, "thumbnails");

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.mkdir(thumbnailDir, { recursive: true });
  } catch (error) {
    console.error("Error creating directories:", error);
  }
}

ensureDirectories();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images, documents, and text files
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/svg+xml",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "image/tiff",

    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/vnd.oasis.opendocument.presentation",
    "text/plain",
    "application/rtf",
    "text/markdown",

    // Archives
    "application/zip",
    "application/x-rar-compressed",
    "application/x-tar",
    "application/gzip",
    "application/x-7z-compressed",

    // Audio
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "audio/mp4",
    "audio/flac",

    // Video
    "video/mp4",
    "video/webm",
    "video/x-msvideo",
    "video/quicktime",
    "video/x-matroska",

    // Other
    "text/csv",
    "application/json",
    "application/xml",
    "text/html",
    "text/css",
    "text/javascript",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images, documents, and text files are allowed."
      ),
      false
    );
  }
};

// Configure multer
const uploadMulter = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Helper function to get file info
async function getFileInfo(filePath) {
  try {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mime.lookup(ext) || "application/octet-stream";

    return {
      size: stats.size,
      createdAt: stats.birthtime,
      mimeType: mimeType,
      isImage: mimeType.startsWith("image/"),
    };
  } catch (error) {
    console.error("Error getting file info:", error);
    return null;
  }
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Page Routes
router.get("/upload", fileController.getUploadPage);
router.get("/gallery", fileController.getGallery);

// API Routes
router.post("/upload", uploadMulter.array("files"), fileController.uploadFiles);
router.delete("/api/files/:filename", fileController.deleteFile);

export default router;
