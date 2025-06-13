import express from 'express';
import {
    getHomePage,
    getUploadPage,
    getGalleryPage,
    getErrorPage
} from '../controllers/viewController.js';
import { getSharedFile } from '../controllers/shareController.js';

const router = express.Router();

// Main page routes
router.get('/', getHomePage);
router.get('/upload', getUploadPage);
router.get('/gallery', getGalleryPage);

// Shared file access
router.get('/shared/:shareId', getSharedFile);

// Error page (for direct access, most errors will be handled by errorHandler middleware)
router.get('/error', getErrorPage);

export default router;