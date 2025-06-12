import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {fileURLToPath} from "url";

const router = express.Router();


// Define the upload directory properly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Optional: Add file type validation
        cb(null, true);
    }
});

router.post('/upload', multer().single('uploadedImage'), (req, res) => {
    const file = req.file;
    console.log('File received:', file);
    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Define the upload directory
    const uploadDir = path.join(__dirname, 'uploads');

    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }


    return res.status(200).json({
        status: "success",
        message: 'File uploaded successfully',
        file: {
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path
        }
    });

});

export default router;