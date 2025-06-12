const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = require('../config/storage');
const File = require('../models/File');

// Get all files
router.get('/files', async (req, res) => {
    try {
        const files = await File.find().sort({ uploadedAt: -1 });
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single file by ID
router.get('/files/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.json(file);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload a file
router.post('/files', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = new File({
            filename: req.file.key || req.file.filename,
            originalname: req.file.originalname,
            path: req.file.location || `/uploads/${req.file.filename}`,
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedBy: req.user?.id || 'anonymous'
        });

        await file.save();

        res.status(201).json(file);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a file
router.delete('/files/:id', async (req, res) => {
    try {
        const file = await File.findByIdAndDelete(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // If using local storage, also delete the file from disk
        if (!file.path.startsWith('http')) {
            const fs = require('fs');
            fs.unlinkSync(path.join(__dirname, '..', file.path));
        }

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;