require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ai', aiRoutes);

// Database connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB (Auth Service)');
    app.listen(PORT, () => {
        console.log(`Auth Service running on port ${PORT}`);
    });
})
.catch((err) => {
    console.error('Database connection error:', err);
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Auth Service Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});
