const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    developerId: {
        type: String,
        required: true
    },
    appType: {
        type: String,
        required: true,
        enum: ['Pro', 'Web/Android'],
        trim: true
    },
    appId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    appPassword: {
        type: String,
        required: true
    },
    smsKeyword: {
        type: String,
        trim: true
    },
    ussdKeyword: {
        type: String,
        trim: true
    },
    deliveryTime: {
        type: String,
        required: false
    },
    webUrl: {
        type: String,
        trim: true,
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
