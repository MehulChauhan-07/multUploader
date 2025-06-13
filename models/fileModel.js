import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
        unique: true
    },
    originalname: {
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
    path: {
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    // Enhanced fields for new features
    tags: {
        type: [String],
        default: []
    },
    folderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },
    // Sharing functionality
    shareId: {
        type: String,
        sparse: true,
        index: true
    },
    shareExpires: {
        type: Date,
        default: null
    },
    // User relation (if implementing authentication)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
});

// Indexes for better query performance
FileSchema.index({ mimetype: 1 });
FileSchema.index({ uploadedAt: -1 });
FileSchema.index({ tags: 1 });

// Virtual field for frontend URL
FileSchema.virtual('url').get(function() {
    return `/uploads/${this.filename}`;
});

// Ensure virtual fields are included when converting to JSON
FileSchema.set('toJSON', { virtuals: true });
FileSchema.set('toObject', { virtuals: true });

const File = mongoose.model('File', FileSchema);

export default File;