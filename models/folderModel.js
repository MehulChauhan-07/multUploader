import mongoose from 'mongoose';

const FolderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },
    path: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // User relation (if implementing authentication)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
});

// Virtual to get full path
FolderSchema.virtual('fullPath').get(function() {
    return this.path ? this.path + '/' + this.name : this.name;
});

// Ensure virtuals are included in JSON
FolderSchema.set('toJSON', { virtuals: true });
FolderSchema.set('toObject', { virtuals: true });

const Folder = mongoose.model('Folder', FolderSchema);

export default Folder;