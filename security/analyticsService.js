const UploadAnalytics = require('../models/UploadAnalytics');

exports.trackUpload = async (fileData, userId) => {
    try {
        await UploadAnalytics.create({
            fileId: fileData.id,
            fileSize: fileData.size,
            fileType: fileData.mimetype,
            userId: userId || 'anonymous',
            timestamp: Date.now(),
            browser: fileData.metadata?.browser || 'unknown',
            os: fileData.metadata?.os || 'unknown',
            deviceType: fileData.metadata?.deviceType || 'unknown',
            ipAddress: fileData.metadata?.ipAddress || 'unknown'
        });

        console.log('Upload tracked successfully');
    } catch (error) {
        console.error('Error tracking upload:', error);
    }
};

exports.getUploadStats = async (period = 'day') => {
    try {
        const now = new Date();
        let startDate;

        switch(period) {
            case 'day':
                startDate = new Date(now.setDate(now.getDate() - 1));
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            default:
                startDate = new Date(now.setDate(now.getDate() - 1));
        }

        const stats = await UploadAnalytics.aggregate([
            {
                $match: {
                    timestamp: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        fileType: "$fileType"
                    },
                    count: { $sum: 1 },
                    totalSize: { $sum: "$fileSize" }
                }
            }
        ]);

        return stats;
    } catch (error) {
        console.error('Error getting upload stats:', error);
        throw error;
    }
};