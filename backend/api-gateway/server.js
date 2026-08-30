require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 4000;

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// --- Authentication Middleware --- //
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Skip auth routes (login, register) and BDApps webhooks
    const skipRoutes = [
        '/api/v1/auth',
        '/api/v1/sms/message-receiving-url',
        '/api/v1/subscription/subscription-notification-url',
        '/api/v1/ussd/ussd-connection-url',
        '/api/v1/otp/send',
        '/api/v1/otp/verify'
    ];
    
    if (skipRoutes.some(route => req.path.startsWith(route))) {
        return next();
    }
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Inject decoded user details into headers for downstream microservices
            req.headers['x-user-id'] = decoded.id;
            req.headers['x-user-role'] = decoded.role;
        } catch (err) {
            console.error('API Gateway: Invalid token');
            // return res.status(401).json({ success: false, message: 'Invalid or expired token' });
            // For now we don't strictly block if token is invalid here, let downstream services decide if they want to fail. 
            // Or better yet, since we want isolation, block if there's an invalid token!
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }
    } else {
        // If no token is provided at all
        return res.status(401).json({ success: false, message: 'Authentication token missing' });
    }
    next();
};

app.use(authMiddleware);

// --- Proxy Rules --- //

// Auth Service Proxy
app.use('/api/v1/auth', createProxyMiddleware({ 
    target: process.env.AUTH_SERVICE_URL, 
    changeOrigin: true 
}));

// Project Service Proxy
app.use('/api/v1/projects', createProxyMiddleware({ 
    target: process.env.PROJECT_SERVICE_URL, 
    changeOrigin: true 
}));

// SMS Service Proxy
app.use('/api/v1/sms', createProxyMiddleware({ 
    target: process.env.SMS_SERVICE_URL || 'http://localhost:4003', 
    changeOrigin: true 
}));

// OTP Service Proxy
app.use('/api/v1/otp', createProxyMiddleware({ 
    target: process.env.OTP_SERVICE_URL || 'http://localhost:4004', 
    changeOrigin: true 
}));

// Subscription Service Proxy
app.use('/api/v1/subscription', createProxyMiddleware({ 
    target: process.env.SUBSCRIPTION_SERVICE_URL || 'http://localhost:4005', 
    changeOrigin: true 
}));

// Analytics Service Proxy
app.use('/api/v1/analytics', createProxyMiddleware({ 
    target: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4006', 
    changeOrigin: true 
}));

// USSD Service Proxy
app.use('/api/v1/ussd', createProxyMiddleware({ 
    target: process.env.USSD_SERVICE_URL || 'http://localhost:4007', 
    changeOrigin: true 
}));

// Fallback Route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'BDApps API Gateway is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('API Gateway Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'API Gateway Error'
    });
});

app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
