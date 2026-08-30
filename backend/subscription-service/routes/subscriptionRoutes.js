const express = require('express');
const { subscribe, unsubscribe, unsubscribeByMsisdn, getSubscription, getActiveSubscribers, handleSubscriptionNotificationUrl, getAllSubscriptions } = require('../controllers/subscriptionController');

const router = express.Router();

// =========================================================================
// BDAPPS DASHBOARD: Subscription Notification URL
// URL to put in Bdapps: http://your-domain.com/api/v1/subscription/subscription-notification-url
// =========================================================================
router.post('/subscription-notification-url', handleSubscriptionNotificationUrl);

// Internal routes called by your website (Web Subscription via API)
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.post('/unsubscribe-by-msisdn', unsubscribeByMsisdn);
router.get('/status', getSubscription);
router.get('/active/:projectId', getActiveSubscribers);
router.get('/all', getAllSubscriptions);

module.exports = router;
