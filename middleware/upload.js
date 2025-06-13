import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '../utils/constants.js';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename with original extension
        const fileExtension = path.extname(file.originalname);
        const uniqueFilename = `${uuidv4()}${fileExtension}`;
        cb(null, uniqueFilename);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    // Check if the file type is allowed
    const mimetype = file.mimetype;

    if (ALLOWED_FILE_TYPES.includes(mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${mimetype} is not supported`), false);
    }
};

// Create multer instance
const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE // 10MB
    },
    fileFilter
});

// Export middleware
export const uploadMiddleware = upload.array('files', 10); // Max 10 files at once

// Error handler for multer
export const handleMulterErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB.'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    next();
};