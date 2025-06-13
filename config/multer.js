import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure upload directory
const uploadDir = path.join(__dirname, "../uploads");

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
    "image/png",
    "image/gif",
    "image/svg+xml",
    "image/webp",
    "image/bmp",
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
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export default upload;
