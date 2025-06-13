import File from "../models/File.js";

class FileController {
  async getGallery(req, res) {
    try {
      const { type } = req.query;
      const files = await File.getAllFiles(type);

      res.render("gallery", {
        title: "File Gallery",
        activePage: "gallery",
        files: files,
        selectedType: type || "all",
      });
    } catch (error) {
      console.error("Error loading gallery:", error);
      res.status(500).render("error", {
        title: "Error",
        activePage: "error",
        message: "Error loading gallery",
        error: error,
      });
    }
  }

  async uploadFiles(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      const uploadedFiles = [];

      for (const file of req.files) {
        const fileInfo = await File.getFileInfo(file.path);

        // Create thumbnail for images
        if (fileInfo?.isImage) {
          await File.createThumbnail(file.path, file.filename);
        }

        uploadedFiles.push({
          filename: file.filename,
          originalname: file.originalname,
          mimetype: fileInfo?.mimeType || file.mimetype,
          size: File.formatFileSize(fileInfo?.size || 0),
          createdAt: fileInfo?.createdAt || new Date(),
          isImage: fileInfo?.isImage || false,
          url: `/uploads/${file.filename}`,
          thumbnailUrl: fileInfo?.isImage
            ? `/uploads/thumbnails/${file.filename}`
            : null,
        });
      }

      res.json({
        success: true,
        message: "Files uploaded successfully",
        files: uploadedFiles,
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error uploading files",
      });
    }
  }

  async deleteFile(req, res) {
    try {
      const { filename } = req.params;
      await File.deleteFile(filename);

      res.json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting file",
      });
    }
  }

  getUploadPage(req, res) {
    res.render("home", {
      title: "File Upload",
      activePage: "upload",
    });
  }
}

export default new FileController();
