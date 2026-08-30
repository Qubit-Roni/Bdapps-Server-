require('dotenv').config({ path: '../.env' }); // Shared environment if needed
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const ussdRoutes = require('./routes/ussdRoutes');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 4007;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bdapps_server')
  .then(() => console.log('Connected to MongoDB (USSD Service)'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/v1/ussd', ussdRoutes);

app.listen(PORT, () => {
    console.log(`USSD Service running on port ${PORT}`);
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('USSD Service Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: 'USSD API Error: ' + (err.message || 'Internal Server Error')
    });
});

