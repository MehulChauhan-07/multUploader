const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Not an accepted file format'), false);
    }
};

// Initialize upload middleware
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

// Route to render upload form
app.get('/', (req, res) => {
    res.render('index', { files: [] });
});

// Route to handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).render('index', {
                error: 'No file selected!',
                files: []
            });
        }

        // Read the uploaded files to display in the index page
        fs.readdir(uploadDir, (err, files) => {
            if (err) {
                return res.status(500).render('index', {
                    error: 'Error reading files',
                    files: []
                });
            }

            const uploadedFiles = files.map(file => {
                return {
                    name: file,
                    url: `/uploads/${file}`,
                    date: fs.statSync(path.join(uploadDir, file)).mtime
                };
            });

            res.render('index', {
                success: 'File uploaded successfully!',
                files: uploadedFiles
            });
        });
    } catch (error) {
        res.status(500).render('index', {
            error: error.message,
            files: []
        });
    }
});

// Route to handle multiple file uploads
app.post('/upload-multiple', upload.array('files', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).render('index', {
                error: 'No files selected!',
                files: []
            });
        }

        fs.readdir(uploadDir, (err, files) => {
            if (err) {
                return res.status(500).render('index', {
                    error: 'Error reading files',
                    files: []
                });
            }

            const uploadedFiles = files.map(file => {
                return {
                    name: file,
                    url: `/uploads/${file}`,
                    date: fs.statSync(path.join(uploadDir, file)).mtime
                };
            });

            res.render('index', {
                success: `${req.files.length} files uploaded successfully!`,
                files: uploadedFiles
            });
        });
    } catch (error) {
        res.status(500).render('index', {
            error: error.message,
            files: []
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});