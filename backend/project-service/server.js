require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const initScheduler = require('./cron/contentScheduler');

const projectRoutes = require('./routes/projectRoutes');

const app = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/projects', projectRoutes);

// Database connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB (Project Service)');
    app.listen(PORT, () => {
        console.log(`Project Service running on port ${PORT}`);
        initScheduler();
    });
})
.catch((err) => {
    console.error('Database connection error:', err);
});
