// File size limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed file types
export const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav'
];

// Share expiration options (in ms)
export const SHARE_EXPIRATION_OPTIONS = {
    '1h': 60 * 60 * 1000,           // 1 hour
    '1d': 24 * 60 * 60 * 1000,      // 1 day
    '7d': 7 * 24 * 60 * 60 * 1000,  // 7 days
    '30d': 30 * 24 * 60 * 60 * 1000 // 30 days
};