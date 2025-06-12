const dotenv = require('dotenv');
const path = require('path');

// Load environment-specific variables
if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: path.join(__dirname, '../.env.production') });
} else if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: path.join(__dirname, '../.env.test') });
} else {
    dotenv.config({ path: path.join(__dirname, '../.env.development') });
}

module.exports = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/fileupload',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpire: process.env.JWT_EXPIRE || '1d',
    awsRegion: process.env.AWS_REGION,
    awsAccessKey: process.env.AWS_ACCESS_KEY_ID,
    awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3BucketName: process.env.S3_BUCKET_NAME,
    uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '../uploads'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(','),
    corsOrigin: process.env.CORS_ORIGIN || '*'
};