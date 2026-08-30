const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    developerId: {
        type: String,
        required: true
    },
    subKeyword: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String,
        required: true
    },
    contentBody: {
        type: String,
        required: true,
        maxlength: 300,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);
