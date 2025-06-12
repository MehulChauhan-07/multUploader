const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const config = require('./config/config');

// Import models
const File = require('./models/File');

// Import routes
const apiRoutes = require('./routes/api');
const categoryRoutes = require('./routes/category');
const searchRoutes = require('./routes/search');

// Import middleware
const { protect } = require('./middleware/auth');
const uploadLimiter = require('./middleware/rateLimiter');
const securityHeaders = require('./middleware/securityHeaders');

// Import services
const analyticsService = require('./services/analyticsService');
const { processImage } = require('./utils/imageProcessor');

const app = express();
const port = config.port;

// Apply security headers
securityHeaders(app);

// Connect to MongoDB
mongoose.connect(config.mongoUri)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('MongoDB connection error:', err));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: config.jwtSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: config.nodeEnv === 'production' }
}));
app.use(morgan('dev'));

// Create uploads folder if it doesn't exist
const uploadDir = config.uploadDir;
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    if (config.allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Not an accepted file format'), false);
    }
};

// Initialize upload middleware
const upload = multer({
    storage: storage,
    limits: { fileSize: config.maxFileSize },
    fileFilter: fileFilter
});

// Apply rate limiting to upload routes
app.use('/upload', uploadLimiter);
app.use('/upload-multiple', uploadLimiter);

// Routes
app.use('/api', apiRoutes);
app.use('/categories', categoryRoutes);
app.use('/search', searchRoutes);

// Route to render upload form
app.get('/', async (req, res) => {
    try {
        const files = await File.find().sort({ uploadedAt: -1 }).limit(20);

        res.render('index', {
            files,
            user: req.session.user || null
        });
    } catch (error) {
        console.error(error);
        res.render('index', {
            error: 'Error fetching files',
            files: []
        });
    }
});

// Route to handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).render('index', {
                error: 'No file selected!',
                files: []
            });
        }

        // Store file metadata in database
        const fileData = {
            filename: req.file.filename,
            originalname: req.file.originalname,
            path: `/uploads/${req.file.filename}`,
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedBy: req.session.user?.id || 'anonymous',
            uploadedAt: new Date()
        };

        // If it's an image, process it
        if (req.file.mimetype.startsWith('image/')) {
            try {
                await processImage(path.join(uploadDir, req.file.filename), { width: 800 });
            } catch (err) {
                console.error('Error processing image:', err);
                // Continue even if image processing fails
            }
        }

        const file = new File(fileData);
        await file.save();

        // Track analytics
        await analyticsService.trackUpload(fileData, req.session.user?.id);

        // Get all files to display
        const files = await File.find().sort({ uploadedAt: -1 }).limit(20);

        res.render('index', {
            success: 'File uploaded successfully!',
            files,
            user: req.session.user || null
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('index', {
            error: error.message,
            files: []
        });
    }
});

// Route to handle multiple file uploads
app.post('/upload-multiple', upload.array('files', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).render('index', {
                error: 'No files selected!',
                files: []
            });
        }

        // Store files metadata in database
        const savedFiles = [];

        for (const file of req.files) {
            const fileData = {
                filename: file.filename,
                originalname: file.originalname,
                path: `/uploads/${file.filename}`,
                mimetype: file.mimetype,
                size: file.size,
                uploadedBy: req.session.user?.id || 'anonymous',
                uploadedAt: new Date()
            };

            // If it's an image, process it
            if (file.mimetype.startsWith('image/')) {
                try {
                    await processImage(path.join(uploadDir, file.filename), { width: 800 });
                } catch (err) {
                    console.error('Error processing image:', err);
                    // Continue even if image processing fails
                }
            }

            const newFile = new File(fileData);
            await newFile.save();
            savedFiles.push(newFile);

            // Track analytics
            await analyticsService.trackUpload(fileData, req.session.user?.id);
        }

        // Get all files to display
        const files = await File.find().sort({ uploadedAt: -1 }).limit(20);

        res.render('index', {
            success: `${req.files.length} files uploaded successfully!`,
            files,
            user: req.session.user || null
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('index', {
            error: error.message,
            files: []
        });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || 'Something went wrong!';

    res.status(statusCode).render('index', {
        error: errorMessage,
        files: []
    });
});

// Start the server
const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Set up WebSocket for real-time updates
const setupSocket = require('./config/socket');
const io = setupSocket(server);

// Make io accessible in request object
app.set('io', io);

module.exports = app;