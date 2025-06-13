// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong!';

    // If API request
    if (req.originalUrl.startsWith('/api')) {
        return res.status(statusCode).json({
            success: false,
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // For web pages
    res.status(statusCode).render('error', {
        title: `Error ${statusCode}`,
        message,
        error: process.env.NODE_ENV === 'development' ? err : { status: statusCode },
        pageStyles: [],
        pageScripts: []
    });
};

// 404 handler
export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};