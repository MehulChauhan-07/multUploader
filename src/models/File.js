import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import mime from "mime-types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class File {
  constructor() {
    this.uploadDir = path.join(__dirname, "../../uploads");
    this.thumbnailDir = path.join(this.uploadDir, "thumbnails");
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.thumbnailDir, { recursive: true });
    } catch (error) {
      console.error("Error creating directories:", error);
      throw error;
    }
  }

  async getFileInfo(filePath) {
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

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  async createThumbnail(filePath, filename) {
    try {
      const thumbnailPath = path.join(this.thumbnailDir, filename);
      await sharp(filePath)
        .resize(200, 200, { fit: "inside" })
        .toFile(thumbnailPath);
      return true;
    } catch (error) {
      console.error("Error creating thumbnail:", error);
      return false;
    }
  }

  async getAllFiles(type = null) {
    try {
      const files = await fs.readdir(this.uploadDir);
      let fileList = [];

      for (const file of files) {
        if (file === "thumbnails") continue;

        const filePath = path.join(this.uploadDir, file);
        const fileInfo = await this.getFileInfo(filePath);

        if (fileInfo) {
          const mainType = fileInfo.mimeType.split("/")[0];
          const subType = fileInfo.mimeType.split("/")[1];

          // Apply type filter if specified
          if (type && type !== "all") {
            if (type === "image" && !fileInfo.mimeType.startsWith("image/"))
              continue;
            if (type === "pdf" && !fileInfo.mimeType.includes("pdf")) continue;
            if (
              type === "doc" &&
              !fileInfo.mimeType.includes("document") &&
              !fileInfo.mimeType.includes("word")
            )
              continue;
            if (type === "video" && !fileInfo.mimeType.startsWith("video/"))
              continue;
            if (type === "audio" && !fileInfo.mimeType.startsWith("audio/"))
              continue;
            if (
              type === "archive" &&
              !fileInfo.mimeType.includes("zip") &&
              !fileInfo.mimeType.includes("rar") &&
              !fileInfo.mimeType.includes("tar") &&
              !fileInfo.mimeType.includes("gzip") &&
              !fileInfo.mimeType.includes("7z")
            )
              continue;
            if (
              type === "other" &&
              (fileInfo.mimeType.startsWith("image/") ||
                fileInfo.mimeType.startsWith("video/") ||
                fileInfo.mimeType.startsWith("audio/") ||
                fileInfo.mimeType.includes("pdf") ||
                fileInfo.mimeType.includes("document") ||
                fileInfo.mimeType.includes("word") ||
                fileInfo.mimeType.includes("zip") ||
                fileInfo.mimeType.includes("rar"))
            )
              continue;
          }

          fileList.push({
            filename: file,
            originalname: file.split("-").slice(2).join("-"),
            mimetype: fileInfo.mimeType,
            size: fileInfo.size,
            uploadedAt: fileInfo.createdAt,
            url: `/uploads/${file}`,
            thumbnailUrl: fileInfo.isImage
              ? `/uploads/thumbnails/${file}`
              : null,
            mainType: mainType,
            subType: subType,
          });
        }
      }

      return fileList;
    } catch (error) {
      console.error("Error getting files:", error);
      throw error;
    }
  }

  async deleteFile(filename) {
    try {
      const filePath = path.join(this.uploadDir, filename);
      const thumbnailPath = path.join(this.thumbnailDir, filename);

      // Delete main file
      await fs.unlink(filePath);

      // Try to delete thumbnail if it exists
      try {
        await fs.unlink(thumbnailPath);
      } catch (error) {
        // Ignore error if thumbnail doesn't exist
      }

      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }
}

export default new File();
