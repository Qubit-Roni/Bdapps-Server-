require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const subscriptionRoutes = require('./routes/subscriptionRoutes');

const app = express();
const PORT = process.env.PORT || 4005;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/v1/subscription', subscriptionRoutes);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB (Subscription Service)');
    app.listen(PORT, () => {
        console.log(`Subscription Service running on port ${PORT}`);
    });
})
.catch((err) => {
    console.error('Database connection error:', err);
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Subscription Service Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: 'Subscription API Error: ' + (err.message || 'Internal Server Error')
    });
});
