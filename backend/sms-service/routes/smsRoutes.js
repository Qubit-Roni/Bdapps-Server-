const express = require('express');
const { sendSms, sendBulkSms, getSmsLogs, handleMessageReceivingUrl, getAllSmsLogs } = require('../controllers/smsController');

const router = express.Router();

// =========================================================================
// BDAPPS DASHBOARD: Message Receiving URL
// URL to put in Bdapps: http://your-domain.com/api/v1/sms/message-receiving-url
// =========================================================================
router.post('/message-receiving-url', handleMessageReceivingUrl);

// Internal routes called by your website for sending SMS
router.post('/send', sendSms);
router.post('/bulk-send', sendBulkSms);
router.get('/logs/:projectId', getSmsLogs);
router.get('/all', getAllSmsLogs);

module.exports = router;
