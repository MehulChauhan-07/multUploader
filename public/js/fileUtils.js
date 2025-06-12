// File type configurations
const FILE_TYPES = {
  // Images
  IMAGES: {
    extensions: [".jpg", ".jpeg", ".png", ".gif"],
    mimeTypes: ["image/jpeg", "image/png", "image/gif"],
    icon: "fa-file-image",
    color: "text-primary",
  },
  // Documents
  DOCUMENTS: {
    extensions: [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
      ".txt",
    ],
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ],
    icon: "fa-file-alt",
    color: "text-secondary",
  },
  // Archives
  ARCHIVES: {
    extensions: [".zip", ".rar", ".7z"],
    mimeTypes: [
      "application/zip",
      "application/x-rar-compressed",
      "application/x-7z-compressed",
    ],
    icon: "fa-file-archive",
    color: "text-dark",
  },
};

// File size limit (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Get all accepted file extensions
const getAllowedExtensions = () => {
  return Object.values(FILE_TYPES)
    .map((type) => type.extensions)
    .flat()
    .join(",");
};

// Get all accepted MIME types
const getAllowedMimeTypes = () => {
  return Object.values(FILE_TYPES)
    .map((type) => type.mimeTypes)
    .flat();
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Get file icon and color based on file type
const getFileTypeInfo = (file) => {
  for (const [type, info] of Object.entries(FILE_TYPES)) {
    if (info.mimeTypes.includes(file.type)) {
      return {
        icon: info.icon,
        color: info.color,
        category: type.toLowerCase(),
      };
    }
  }
  return {
    icon: "fa-file",
    color: "text-secondary",
    category: "other",
  };
};

// Validate file
const validateFile = (file) => {
  const errors = [];

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(
      `File ${file.name} is too large. Maximum size is ${formatFileSize(
        MAX_FILE_SIZE
      )}.`
    );
  }

  // Check file type
  const allowedMimeTypes = getAllowedMimeTypes();
  if (!allowedMimeTypes.includes(file.type)) {
    errors.push(`File ${file.name} is not an accepted file type.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Filter valid files
const filterValidFiles = (files) => {
  return Array.from(files).filter((file) => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      validation.errors.forEach((error) => showNotification(error, "danger"));
    }
    return validation.isValid;
  });
};

// Export all functions and constants
export {
  FILE_TYPES,
  MAX_FILE_SIZE,
  getAllowedExtensions,
  getAllowedMimeTypes,
  formatFileSize,
  getFileTypeInfo,
  validateFile,
  filterValidFiles,
};
