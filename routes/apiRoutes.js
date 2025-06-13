import express from "express";
import {
  uploadFiles,
  getFiles,
  deleteFileById,
  batchDeleteFiles,
  batchDownloadFiles,
  updateFileTags,
  getRecentFiles,
} from "../controllers/fileController.js";
import { createShareLink } from "../controllers/shareController.js";
import { uploadMiddleware, handleMulterErrors } from "../middleware/upload.js";

const router = express.Router();

// File operations
router.post("/upload", uploadMiddleware, handleMulterErrors, uploadFiles);
router.get("/files", getFiles);
router.get("/files/recent", getRecentFiles);
router.delete("/files/:filename", deleteFileById);
router.post("/files/batch-delete", batchDeleteFiles);
router.post("/files/batch-download", batchDownloadFiles);

// File tags
router.post("/files/:filename/tags", updateFileTags);

// File sharing
router.post("/files/:filename/share", createShareLink);

export default router;
