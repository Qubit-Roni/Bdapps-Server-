const Subscription = require('../models/Subscription');
const axios = require('axios');

const BDAPPS_SUBSCRIPTION_API_URL = process.env.BDAPPS_SUBSCRIPTION_API_URL || 'https://developer.bdapps.com/subscription/send';

// Helper to fetch app credentials
const getAppCredentials = async (projectId) => {
    try {
        const res = await axios.get(`http://localhost:4002/api/v1/projects/applications/${projectId}`);
        if (res.data && res.data.success) {
            return res.data.data;
        }
        return null;
    } catch (err) {
        console.error('Failed to fetch app credentials', err.message);
        return null;
    }
};

exports.subscribe = async (req, res) => {
    try {
        const developerId = req.headers['x-user-id'];
        if (!developerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { projectId, msisdn, planId } = req.body;
        
        const app = await getAppCredentials(projectId);
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found for Subscription' });
        }

        const payload = {
            applicationId: app.appId,
            password: app.appPassword,
            subscriberId: msisdn,
            action: "1" // 1 for Subscribe
        };

        const response = await axios.post(BDAPPS_SUBSCRIPTION_API_URL, payload);

        const subscription = await Subscription.create({
            developerId,
            projectId,
            msisdn,
            planId,
            status: 'active',
            nextChargeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            history: [{
                action: 'subscribe',
                details: 'User successfully subscribed via API',
                operatorResponse: response.data
            }]
        });

        res.status(200).json({ success: true, message: 'Subscription successful', subscription, bdappsResponse: response.data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.unsubscribe = async (req, res) => {
    try {
        const developerId = req.headers['x-user-id'];
        if (!developerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { subscriptionId } = req.body;
        
        const subscription = await Subscription.findOne({ _id: subscriptionId, developerId });
        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }

        const app = await getAppCredentials(subscription.projectId);
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found for Unsubscription' });
        }

        const payload = {
            applicationId: app.appId,
            password: app.appPassword,
            subscriberId: subscription.msisdn,
            action: "0" // 0 for Unsubscribe
        };

        const response = await axios.post(BDAPPS_SUBSCRIPTION_API_URL, payload);

        subscription.status = 'inactive';
        subscription.history.push({
            action: 'unsubscribe',
            details: 'User unsubscribed successfully',
            operatorResponse: response.data
        });
        
        await subscription.save();

        res.status(200).json({ success: true, message: 'Unsubscribed successfully', subscription, bdappsResponse: response.data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.unsubscribeByMsisdn = async (req, res) => {
    try {
        const developerId = req.headers['x-user-id'];
        if (!developerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { projectId, msisdn } = req.body;
        
        const subscription = await Subscription.findOne({ projectId, msisdn, developerId, status: 'active' });
        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Active subscription not found' });
        }

        const app = await getAppCredentials(subscription.projectId);
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found for Unsubscription' });
        }

        const payload = {
            applicationId: app.appId,
            password: app.appPassword,
            subscriberId: subscription.msisdn,
            action: "0" // 0 for Unsubscribe
        };

        const response = await axios.post(BDAPPS_SUBSCRIPTION_API_URL, payload);

        subscription.status = 'inactive';
        subscription.history.push({
            action: 'unsubscribe',
            details: 'User unsubscribed successfully via Msisdn',
            operatorResponse: response.data
        });
        
        await subscription.save();

        res.status(200).json({ success: true, message: 'Unsubscribed successfully', subscription, bdappsResponse: response.data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.getSubscription = async (req, res) => {
    try {
        const developerId = req.headers['x-user-id'];
        if (!developerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { msisdn, projectId } = req.query;
        const subscription = await Subscription.findOne({ msisdn, projectId, developerId });
        
        if (!subscription) {
            return res.status(404).json({ success: false, message: 'No active subscription found' });
        }
        
        res.status(200).json({ success: true, subscription });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getActiveSubscribers = async (req, res) => {
    try {
        const developerId = req.headers['x-user-id'];
        if (!developerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { projectId } = req.params;
        const activeSubscriptions = await Subscription.find({ projectId, developerId, status: 'active' });
        
        const msisdns = activeSubscriptions.map(sub => sub.msisdn);
        
        res.status(200).json({ success: true, count: msisdns.length, data: msisdns });
    } catch (error) {
        console.error('Error fetching active subscribers:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// This function receives incoming subscription notifications from Bdapps
exports.handleSubscriptionNotificationUrl = async (req, res) => {
    try {
        // Bdapps sends sync/async notifications here when a user subscribes or unsubscribes
        const { subscriberId, status, frequency } = req.body;
        
        // Find subscription by msisdn
        let subscription = await Subscription.findOne({ msisdn: subscriberId });
        
        if (subscription) {
            // "REGISTERED" or "UNREGISTERED" are standard status strings from BDApps
            subscription.status = status === 'REGISTERED' ? 'active' : 'inactive';
            subscription.history.push({
                action: status,
                details: 'Status updated via BDApps Notification URL'
            });
            await subscription.save();
        }

        res.status(200).json({ success: true, message: 'Notification received successfully' });
    } catch (error) {
        console.error('Error handling subscription notification:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAllSubscriptions = async (req, res) => {
    try {
        const developerId = req.headers['x-user-id'];
        if (!developerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { projectId, startDate, endDate } = req.query;
        const query = { developerId };

        if (projectId) {
            query.projectId = projectId;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const subscriptions = await Subscription.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: subscriptions.length, data: subscriptions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
