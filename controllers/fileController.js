import File from "../models/fileModel.js";
import { deleteFile, getFilePath } from "../services/fileService.js";
import { createShareId } from "../utils/helpers.js";
import { getExpirationDate } from "../utils/helpers.js";
import path from "path";
import fs from "fs/promises";
import archiver from "archiver";

// Upload files
export const uploadFiles = async (req, res, next) => {
  try {
    // req.files is populated by multer middleware
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    // Get the folder ID if provided
    const folderId = req.body.folderId || null;

    // Create File documents for each uploaded file
    const uploadedFiles = await Promise.all(
      req.files.map(async (file) => {
        const newFile = new File({
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          folderId,
          // If authentication is implemented
          // userId: req.user._id
        });

        await newFile.save();
        return newFile;
      })
    );

    res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    next(error);
  }
};

// Get all files (API)
export const getFiles = async (req, res, next) => {
  try {
    const { type, folder, sort, order } = req.query;

    // Build query
    const query = {};

    // Filter by type if provided
    if (type && type !== "all") {
      query.mimetype = new RegExp(type, "i");
    }

    // Filter by folder if provided
    if (folder) {
      query.folderId = folder;
    }

    // If authentication is implemented
    // query.userId = req.user._id;

    // Determine sort options
    const sortOption = {};
    const validSortFields = ["uploadedAt", "size", "originalname"];
    const sortField = validSortFields.includes(sort) ? sort : "uploadedAt";
    const sortOrder = order === "asc" ? 1 : -1;
    sortOption[sortField] = sortOrder;

    const files = await File.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    next(error);
  }
};

// Delete file
export const deleteFileById = async (req, res, next) => {
  try {
    const { filename } = req.params;

    const file = await File.findOne({ filename });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // If authentication is implemented, check ownership
    // if (file.userId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'You are not authorized to delete this file'
    //   });
    // }

    // Delete file from storage
    await deleteFile(file.path);

    // Delete file document
    await file.remove();

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Batch operations
export const batchDeleteFiles = async (req, res, next) => {
  try {
    const { files } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files specified for deletion",
      });
    }

    const results = await Promise.all(
      files.map(async (filename) => {
        try {
          const file = await File.findOne({ filename });

          if (!file) {
            return { filename, success: false, message: "File not found" };
          }

          // If authentication is implemented, check ownership
          // if (file.userId.toString() !== req.user._id.toString()) {
          //   return { filename, success: false, message: 'Not authorized' };
          // }

          await deleteFile(file.path);
          await file.remove();

          return { filename, success: true };
        } catch (err) {
          return { filename, success: false, message: err.message };
        }
      })
    );

    const successCount = results.filter((r) => r.success).length;

    res.status(200).json({
      success: true,
      message: `${successCount} of ${files.length} files deleted successfully`,
      results,
    });
  } catch (error) {
    next(error);
  }
};

// Batch download as ZIP
export const batchDownloadFiles = async (req, res, next) => {
  try {
    const { files } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files specified for download",
      });
    }

    // Create a temporary filename for the zip
    const zipFilename = `download-${Date.now()}.zip`;
    const zipPath = path.join(process.cwd(), "uploads", zipFilename);

    // Create a write stream for the zip file
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    // Listen for all archive data to be written
    output.on("close", function () {
      // Send the zip file as response
      res.download(zipPath, "files.zip", (err) => {
        if (err) console.error("Download error:", err);

        // Delete the temporary zip after download
        fs.unlink(zipPath).catch((err) =>
          console.error("Error deleting temp zip:", err)
        );
      });
    });

    // Handle archive errors
    archive.on("error", function (err) {
      next(err);
    });

    // Pipe archive data to the output file
    archive.pipe(output);

    // Add each file to the archive
    const fileEntries = await File.find({ filename: { $in: files } });

    for (const file of fileEntries) {
      const filePath = getFilePath(file.filename);
      archive.file(filePath, { name: file.originalname });
    }

    // Finalize the archive
    await archive.finalize();
  } catch (error) {
    next(error);
  }
};

// Update file tags
export const updateFileTags = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const { tags } = req.body;

    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tags format",
      });
    }

    // Find the file
    const file = await File.findOne({ filename });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // If authentication is implemented, check ownership
    // if (file.userId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'You are not authorized to update this file'
    //   });
    // }

    // Clean and validate tags
    const cleanedTags = tags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .filter((tag) => tag.length <= 30) // Limit tag length
      .slice(0, 10); // Limit number of tags

    file.tags = cleanedTags;
    await file.save();

    res.status(200).json({
      success: true,
      message: "Tags updated successfully",
      tags: file.tags,
    });
  } catch (error) {
    next(error);
  }
};

// Get recent files
export const getRecentFiles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4; // Default to 4 recent files
    const files = await File.find()
      .sort({ uploadDate: -1 })
      .limit(limit)
      .select("filename originalname mimetype size uploadDate");

    res.json(files);
  } catch (error) {
    console.error("Error getting recent files:", error);
    res.status(500).json({ error: "Failed to get recent files" });
  }
};
