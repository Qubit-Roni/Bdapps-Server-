const mongoose = require('mongoose');

const otpLogSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    msisdn: {
        type: String,
        required: true
    },
    otpCode: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'expired', 'failed'],
        default: 'pending'
    },
    expiresAt: {
        type: Date,
        required: true
    },
    retryCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Create TTL index to automatically remove expired OTP logs if needed
// otpLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpLog', otpLogSchema);
