const mongoose = require('mongoose');

const smsLogSchema = new mongoose.Schema({
    developerId: {
        type: String,
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    msisdn: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed'],
        default: 'pending'
    },
    operatorResponse: {
        type: Object
    }
}, { timestamps: true });

module.exports = mongoose.model('SmsLog', smsLogSchema);
