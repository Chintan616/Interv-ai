const helmet = require('helmet');

const setupSecurityHeaders = (app) => {
    // Basic security headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "https://checkout.razorpay.com", "'unsafe-inline'"],
                frameSrc: ["https://api.razorpay.com"],
                connectSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
                imgSrc: ["'self'", "data:", "https:", "blob:"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                fontSrc: ["'self'", "data:"]
            }
        },
        crossOriginEmbedderPolicy: false
    }));
    
    // Additional security headers
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        next();
    });
};

module.exports = setupSecurityHeaders;
