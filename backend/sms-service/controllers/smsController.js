const SmsLog = require('../models/SmsLog');
const axios = require('axios');

// Default BDApps SMS API URL
const BDAPPS_SMS_API_URL = process.env.BDAPPS_SMS_API_URL || 'https://developer.bdapps.com/sms/send';

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

exports.sendSms = async (req, res) => {
    try {
        const developerId = req.headers['x-user-id'];
        if (!developerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { projectId, msisdn, message } = req.body;
        
        const app = await getAppCredentials(projectId);
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found for SMS' });
        }

        const log = await SmsLog.create({
            developerId,
            projectId,
            msisdn,
            message,
            status: 'pending'
        });

        const payload = {
            applicationId: app.appId,
            password: app.appPassword,
            destinationAddresses: [msisdn],
            message: message
        };

        const response = await axios.post(BDAPPS_SMS_API_URL, payload);

        log.status = 'sent';
        log.operatorResponse = response.data;
        await log.save();

        res.status(200).json({ success: true, message: 'SMS Sent successfully', logId: log._id, bdappsResponse: response.data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.sendBulkSms = async (req, res) => {
    try {
        const developerId = req.headers['x-user-id'];
        if (!developerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { projectId, msisdns, message } = req.body;
        
        if (!msisdns || !Array.isArray(msisdns)) {
            return res.status(400).json({ success: false, message: 'msisdns array is required' });
        }

        const app = await getAppCredentials(projectId);
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found for Bulk SMS' });
        }

        const payload = {
            applicationId: app.appId,
            password: app.appPassword,
            destinationAddresses: msisdns,
            message: message
        };

        let apiResponseData = null;
        try {
            const response = await axios.post(BDAPPS_SMS_API_URL, payload);
            apiResponseData = response.data;
            
            const logsToInsert = msisdns.map(msisdn => ({
                developerId,
                projectId,
                msisdn,
                message,
                status: 'sent',
                operatorResponse: apiResponseData
            }));
            await SmsLog.insertMany(logsToInsert);

            res.status(200).json({ success: true, message: `Bulk SMS sent successfully to ${msisdns.length} users.`, bdappsResponse: apiResponseData });
        } catch (apiError) {
            // Bdapps API failed (e.g. invalid password, 400, 401, 500)
            const errorData = apiError.response ? apiError.response.data : apiError.message;
            
            const logsToInsert = msisdns.map(msisdn => ({
                developerId,
                projectId,
                msisdn,
                message,
                status: 'failed',
                operatorResponse: errorData
            }));
            await SmsLog.insertMany(logsToInsert);

            res.status(500).json({ success: false, message: 'SMS API failed', error: apiError.message, bdappsResponse: errorData });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};



// This function receives incoming SMS messages (MO messages) from Bdapps
exports.handleMessageReceivingUrl = async (req, res) => {
    try {
        // Bdapps sends User's Incoming SMS here
        const { sourceAddress, message, requestId, encoding, version } = req.body;
        
        console.log(`Received SMS from ${sourceAddress}: ${message}`);
        
        // Log it or process keyword (e.g. "START", "STOP")
        // If they send STOP, you could call the subscription-service to unsubscribe them.

        res.status(200).json({ success: true, message: 'Message received successfully' });
    } catch (error) {
        console.error('Error handling incoming message:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getSmsLogs = async (req, res) => {
    try {
        const developerId = req.headers['x-user-id'];
        if (!developerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { projectId } = req.params;
        const { startDate, endDate } = req.query;

        const query = { projectId, developerId };

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

        const logs = await SmsLog.find(query).sort({ createdAt: -1 }).limit(100);
        res.status(200).json({ success: true, count: logs.length, logs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAllSmsLogs = async (req, res) => {
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

        const logs = await SmsLog.find(query).sort({ createdAt: -1 }).limit(500); // Limit to 500 for performance
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
