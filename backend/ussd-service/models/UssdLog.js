const mongoose = require('mongoose');

const ussdLogSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    msisdn: {
        type: String,
        required: true
    },
    sessionId: {
        type: String
    },
    messageReceived: {
        type: String
    },
    responseSent: {
        type: String
    },
    action: {
        type: String
    },
    bdappsResponse: {
        type: mongoose.Schema.Types.Mixed
    }
}, { timestamps: true });

module.exports = mongoose.model('UssdLog', ussdLogSchema);
