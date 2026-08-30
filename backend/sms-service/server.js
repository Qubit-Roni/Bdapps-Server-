require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
// In a real app we'd connect to Redis using the `redis` package for queues
// const redis = require('redis');

const smsRoutes = require('./routes/smsRoutes');

const app = express();
const PORT = process.env.PORT || 4003;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/v1/sms', smsRoutes);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB (SMS Service)');
    app.listen(PORT, () => {
        console.log(`SMS Service running on port ${PORT}`);
    });
})
.catch((err) => {
    console.error('Database connection error:', err);
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('SMS Service Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: 'SMS API Error: ' + (err.message || 'Internal Server Error')
    });
});

