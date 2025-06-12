const helmet = require('helmet');

const securityHeaders = (app) => {
    app.use(
        helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
                styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
                imgSrc: ["'self'", "data:", "blob:", "*.amazonaws.com"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'", "cdn.jsdelivr.net"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'self'"]
            }
        })
    );

    app.use(helmet.xssFilter());
    app.use(helmet.noSniff());
    app.use(helmet.hidePoweredBy());
    app.use(helmet.frameguard({ action: 'deny' }));
};

module.exports = securityHeaders;