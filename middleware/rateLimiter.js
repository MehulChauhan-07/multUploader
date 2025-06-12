const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 upload requests per windowMs
    message: 'Too many file uploads from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = uploadLimiter;