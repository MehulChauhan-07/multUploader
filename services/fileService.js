import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

/**
 * Get full file path from filename
 * @param {string} filename - The filename
 * @returns {string} The full file path
 */
export const getFilePath = (filename) => {
    return path.join(process.cwd(), 'uploads', filename);
};

/**
 * Delete a file from the filesystem
 * @param {string} filePath - Path to the file
 * @returns {Promise<void>}
 */
export const deleteFile = async (filePath) => {
    if (existsSync(filePath)) {
        await fs.unlink(filePath);
    }
};

/**
 * Check if file exists in the filesystem
 * @param {string} filename - The filename
 * @returns {boolean} Whether the file exists
 */
export const fileExists = (filename) => {
    const filePath = getFilePath(filename);
    return existsSync(filePath);
};

/**
 * Get file extension from mimetype
 * @param {string} mimetype - The MIME type
 * @returns {string} The file extension
 */
export const getExtensionFromMimetype = (mimetype) => {
    const mimeToExt = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'text/plain': '.txt',
        'application/zip': '.zip',
        'application/x-rar-compressed': '.rar',
        'application/x-7z-compressed': '.7z',
        'video/mp4': '.mp4',
        'audio/mpeg': '.mp3'
    };

    return mimeToExt[mimetype] || '';
};