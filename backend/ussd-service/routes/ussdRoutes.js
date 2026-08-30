const express = require('express');
const { handleUssdConnectionUrl, getUssdLogs } = require('../controllers/ussdController');

const router = express.Router();

// =========================================================================
// BDAPPS DASHBOARD: USSD Connection URL
// URL to put in Bdapps: http://your-domain.com/api/v1/ussd/ussd-connection-url
// =========================================================================
router.post('/ussd-connection-url', handleUssdConnectionUrl);

// Internal routes called by your website for dashboard
router.get('/logs', getUssdLogs);

module.exports = router;
