import File from '../models/fileModel.js';
import Folder from '../models/folderModel.js';
import { fileSizeFormatter } from '../utils/helpers.js';

export const getHomePage = (req, res) => {
    res.redirect('/upload');
};

export const getUploadPage = (req, res) => {
    res.render('upload', {
        title: 'Upload Files',
        activePage: 'upload',
        pageStyles: ['upload'],
        pageScripts: ['upload']
    });
};

export const getGalleryPage = async (req, res, next) => {
    try {
        const selectedType = req.query.type || 'all';
        const folderId = req.query.folder || null;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Build query
        const query = {};

        // Filter by type if provided
        if (selectedType !== 'all') {
            query.mimetype = new RegExp(selectedType, 'i');
        }

        // Filter by folder if provided
        if (folderId) {
            query.folderId = folderId;
        }

        // If authentication is implemented
        // query.userId = req.user._id;

        // Get files
        const files = await File.find(query)
            .sort({ uploadedAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const totalFiles = await File.countDocuments(query);

        // Get folders (if folder feature is implemented)
        const folders = await Folder.find({
            parent: folderId
            // If authentication is implemented
            // userId: req.user._id
        }).sort({ name: 1 });

        // Get current folder path for breadcrumbs
        let currentFolder = null;
        let folderPath = [];

        if (folderId) {
            currentFolder = await Folder.findById(folderId);

            // Build folder path
            if (currentFolder) {
                // Split path and create breadcrumb data
                const pathParts = currentFolder.path.split('/').filter(p => p);

                if (pathParts.length > 0) {
                    // Get all parent folders in one query
                    const parentFolders = await Folder.find({
                        name: { $in: pathParts }
                    });

                    // Build path array
                    folderPath = pathParts.map((part, index) => {
                        const folder = parentFolders.find(f => f.name === part);
                        return {
                            name: part,
                            path: pathParts.slice(0, index + 1).join('/')
                        };
                    });
                }

                // Add current folder to path
                folderPath.push({
                    name: currentFolder.name,
                    path: currentFolder.path + '/' + currentFolder.name
                });
            }
        }

        res.render('gallery', {
            title: 'File Gallery',
            activePage: 'gallery',
            files,
            folders,
            selectedType,
            currentFolder,
            folderPath,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalFiles / limit),
                totalFiles
            },
            pageStyles: ['gallery'],
            pageScripts: ['gallery']
        });
    } catch (error) {
        next(error);
    }
};

export const getErrorPage = (req, res) => {
    const statusCode = req.statusCode || 404;
    const message = req.errorMessage || "The page you're looking for doesn't exist.";
    const error = req.error || { status: statusCode };

    res.status(statusCode).render('error', {
        title: `Error ${statusCode}`,
        message,
        error,
        pageStyles: [],
        pageScripts: []
    });
};