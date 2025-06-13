import File from '../models/fileModel.js';
import { createShareId, getExpirationDate } from '../utils/helpers.js';
import { SHARE_EXPIRATION_OPTIONS } from '../utils/constants.js';

// Create share link
export const createShareLink = async (req, res, next) => {
    try {
        const { filename } = req.params;
        const { expiresIn } = req.body;

        // Validate expiration option
        const validExpirationOptions = Object.keys(SHARE_EXPIRATION_OPTIONS);
        if (expiresIn && !validExpirationOptions.includes(expiresIn)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid expiration option'
            });
        }

        // Find the file
        const file = await File.findOne({ filename });

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // If authentication is implemented, check ownership
        // if (file.userId.toString() !== req.user._id.toString()) {
        //   return res.status(403).json({
        //     success: false,
        //     message: 'You are not authorized to share this file'
        //   });
        // }

        // Create share ID if not exists
        if (!file.shareId) {
            file.shareId = createShareId();
        }

        // Set expiration date
        if (expiresIn === 'never') {
            file.shareExpires = null;
        } else {
            file.shareExpires = getExpirationDate(expiresIn || '1d');
        }

        await file.save();

        // Generate share URL
        const shareUrl = `${req.protocol}://${req.get('host')}/shared/${file.shareId}`;

        res.status(200).json({
            success: true,
            shareId: file.shareId,
            shareUrl,
            expiresAt: file.shareExpires
        });
    } catch (error) {
        next(error);
    }
};

// Access shared file
export const getSharedFile = async (req, res, next) => {
    try {
        const { shareId } = req.params;

        // Find the file by shareId
        const file = await File.findOne({ shareId });

        if (!file) {
            return res.status(404).render('error', {
                title: 'File Not Found',
                message: 'The shared file does not exist or the link has expired',
                error: { status: 404 }
            });
        }

        // Check if link has expired
        if (file.shareExpires && new Date() > file.shareExpires) {
            return res.status(410).render('error', {
                title: 'Link Expired',
                message: 'This share link has expired',
                error: { status: 410 }
            });
        }

        // Render file preview or download based on file type
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            // For images and PDFs, show a preview
            res.render('shared', {
                title: `Shared File: ${file.originalname}`,
                file,
                pageStyles: ['shared'],
                pageScripts: ['shared']
            });
        } else {
            // For other files, prompt download
            res.download(file.path, file.originalname);
        }
    } catch (error) {
        next(error);
    }
};