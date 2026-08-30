const express = require('express');
const { sendOtp, verifyOtp, getOtpLogs } = require('../controllers/otpController');

const router = express.Router();

router.post('/send', sendOtp);
router.post('/verify', verifyOtp);
router.get('/logs', getOtpLogs);

module.exports = router;
