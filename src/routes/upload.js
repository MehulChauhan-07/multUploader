import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();

// Define the upload directory properly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../uploads");

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Simple function to get mimetype from file extension
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    // Images
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
    ".tiff": "image/tiff",
    ".tif": "image/tiff",

    // Documents
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".odt": "application/vnd.oasis.opendocument.text",
    ".ods": "application/vnd.oasis.opendocument.spreadsheet",
    ".odp": "application/vnd.oasis.opendocument.presentation",
    ".txt": "text/plain",
    ".rtf": "application/rtf",
    ".md": "text/markdown",

    // Archives
    ".zip": "application/zip",
    ".rar": "application/x-rar-compressed",
    ".tar": "application/x-tar",
    ".gz": "application/gzip",
    ".7z": "application/x-7z-compressed",

    // Audio
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".m4a": "audio/mp4",
    ".flac": "audio/flac",

    // Video
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".avi": "video/x-msvideo",
    ".mov": "video/quicktime",
    ".mkv": "video/x-matroska",

    // Other
    ".csv": "text/csv",
    ".json": "application/json",
    ".xml": "application/xml",
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
  };

  return mimeTypes[ext] || "application/octet-stream";
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept all file types
    cb(null, true);
  },
});

// Route to render home page
router.get("/", (req, res) => {
  return res.render("home", { title: "Upload Files" });
});

// Route to render gallery page
router.get("/gallery", (req, res) => {
  return res.render("gallery", { title: "File Gallery" });
});

// Route to handle file upload
router.post("/upload", upload.single("uploadedImage"), (req, res) => {
  const file = req.file;
  console.log("File received:", file);

  if (!file) {
    return res.status(400).json({
      status: "error",
      message: "No file uploaded",
    });
  }

  return res.status(200).json({
    status: "success",
    message: "File uploaded successfully",
    file: {
      id: file.filename.split("-")[0],
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/${file.filename}`,
    },
  });
});

// API route to get list of files (for gallery)
router.get("/api/files", async (req, res) => {
  try {
    console.log("Getting files from:", uploadDir);

    // Make sure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      return res.json([]); // Return empty array if directory was just created
    }

    // Read directory contents
    const fileList = await fs.promises.readdir(uploadDir);
    console.log("Files found:", fileList.length);

    // Process files in parallel
    const files = await Promise.all(
      fileList.map(async (filename) => {
        try {
          const filePath = path.join(uploadDir, filename);
          const stats = await fs.promises.stat(filePath);

          if (!stats.isFile()) return null;

          // Split filename parts
          const parts = filename.split("-");
          const id = parts[0];
          const originalname = parts.slice(2).join("-");

          return {
            id: id,
            filename: filename,
            originalname: originalname || filename,
            path: `/uploads/${filename}`,
            mimetype: getMimeType(filename),
            size: stats.size,
            created: stats.birthtime,
          };
        } catch (err) {
          console.error(`Error processing file ${filename}:`, err);
          return null;
        }
      })
    );

    // Filter out null values and handle search, filter, and sort
    let result = files.filter((file) => file !== null);

    // Apply search filter
    if (req.query.search) {
      const search = req.query.search.toLowerCase();
      result = result.filter(
        (file) =>
          file.originalname.toLowerCase().includes(search) ||
          file.mimetype.toLowerCase().includes(search)
      );
    }

    // Apply type filter
    if (req.query.type && req.query.type !== "all") {
      result = result.filter((file) => {
        switch (req.query.type) {
          case "image":
            return file.mimetype.startsWith("image/");
          case "document":
            return [
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "text/plain",
            ].includes(file.mimetype);
          case "other":
            return (
              !file.mimetype.startsWith("image/") &&
              ![
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "text/plain",
              ].includes(file.mimetype)
            );
          default:
            return true;
        }
      });
    }

    // Apply sorting
    if (req.query.sort) {
      switch (req.query.sort) {
        case "newest":
          result.sort((a, b) => new Date(b.created) - new Date(a.created));
          break;
        case "oldest":
          result.sort((a, b) => new Date(a.created) - new Date(b.created));
          break;
        case "size":
          result.sort((a, b) => b.size - a.size);
          break;
        case "name":
          result.sort((a, b) => a.originalname.localeCompare(b.originalname));
          break;
      }
    } else {
      // Default sort by newest
      result.sort((a, b) => new Date(b.created) - new Date(a.created));
    }

    console.log("Returning", result.length, "files");
    return res.json(result);
  } catch (error) {
    console.error("Error getting files:", error);
    return res.status(500).json({
      status: "error",
      message: "Error retrieving files",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// API route to delete a file
router.delete("/api/files/:id", async (req, res) => {
  try {
    const fileId = req.params.id;
    console.log("Deleting file with ID:", fileId);

    const fileList = await fs.promises.readdir(uploadDir);
    const fileToDelete = fileList.find((filename) =>
      filename.startsWith(fileId + "-")
    );

    if (!fileToDelete) {
      console.log("File not found with ID:", fileId);
      return res.status(404).json({
        status: "error",
        message: "File not found",
      });
    }

    const filePath = path.join(uploadDir, fileToDelete);
    console.log("Deleting file at path:", filePath);
    await fs.promises.unlink(filePath);

    return res.json({
      status: "success",
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({
      status: "error",
      message: "Error deleting file",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
