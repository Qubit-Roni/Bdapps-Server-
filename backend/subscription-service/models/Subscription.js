const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
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
    status: {
        type: String,
        enum: ['pending', 'active', 'inactive', 'failed'],
        default: 'pending'
    },
    planId: {
        type: String,
        required: true
    },
    nextChargeDate: {
        type: Date
    },
    lastChargeDate: {
        type: Date
    },
    history: [{
        action: String, // 'subscribe', 'renew', 'unsubscribe', 'charge_failed'
        date: { type: Date, default: Date.now },
        details: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
