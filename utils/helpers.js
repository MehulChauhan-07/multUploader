import crypto from 'crypto';
import { SHARE_EXPIRATION_OPTIONS } from './constants.js';

/**
 * Format file size in human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export const fileSizeFormatter = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate a unique share ID
 * @returns {string} Share ID
 */
export const createShareId = () => {
    return crypto.randomBytes(16).toString('hex');
};

/**
 * Calculate expiration date based on duration
 * @param {string} duration - Duration code (e.g., '1h', '1d', '7d', '30d')
 * @returns {Date} Expiration date
 */
export const getExpirationDate = (duration) => {
    const now = new Date();
    const expirationMs = SHARE_EXPIRATION_OPTIONS[duration] || SHARE_EXPIRATION_OPTIONS['1d'];

    return new Date(now.getTime() + expirationMs);
};

/**
 * Sanitize filename to be safe for filesystem
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
export const sanitizeFilename = (filename) => {
    // Replace potentially dangerous or problematic characters
    return filename
        .replace(/[/\\?%*:|"<>]/g, '-')
        .replace(/\s+/g, '_');
};

/**
 * Check if a file is an image
 * @param {string} mimetype - The file mimetype
 * @returns {boolean} Whether the file is an image
 */
export const isImage = (mimetype) => {
    return mimetype.startsWith('image/');
};

/**
 * Get file type category from mimetype
 * @param {string} mimetype - The file mimetype
 * @returns {string} File category
 */
export const getFileCategory = (mimetype) => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.includes('pdf')) return 'pdf';
    if (mimetype.includes('word') || mimetype.includes('document')) return 'document';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('7z')) return 'archive';
    return 'other';
};