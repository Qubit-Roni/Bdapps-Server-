const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    allowedHostAddress: {
        type: String,
        default: '72.62.127.101'
    },
    messageReceivingUrl: {
        type: String,
        default: 'https://your-domain.com/api/v1/sms/message-receiving-url'
    },
    ussdReceivingUrl: {
        type: String,
        default: 'https://your-domain.com/api/v1/ussd/ussd-connection-url'
    },
    subscriptionNotificationUrl: {
        type: String,
        default: 'https://your-domain.com/api/v1/subscription/subscription-notification-url'
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
