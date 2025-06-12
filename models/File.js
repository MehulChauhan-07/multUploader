const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalname: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    uploadedBy: {
        type: String,
        default: 'anonymous'
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    tags: [String],
    isPublic: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('File', fileSchema);