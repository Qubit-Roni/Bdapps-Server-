const axios = require('axios');
const UssdLog = require('../models/UssdLog');

const BDAPPS_USSD_API_URL = process.env.BDAPPS_USSD_API_URL || 'https://developer.bdapps.com/ussd/send';

// Helper to fetch app credentials
const getAppCredentials = async (appId) => {
    try {
        const res = await axios.get(`http://localhost:4002/api/v1/projects/applications/by-app-id/${appId}`);
        if (res.data && res.data.success) {
            return res.data.data;
        }
        return null;
    } catch (err) {
        console.error('Failed to fetch app credentials', err.message);
        return null;
    }
};

// This function receives incoming USSD sessions from Bdapps
exports.handleUssdConnectionUrl = async (req, res) => {
    try {
        const { applicationId, password, sourceAddress, message, ussdOperation, sessionId } = req.body;
        
        const app = await getAppCredentials(applicationId);
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        let responseMessage = "Welcome to our service!\n1. Subscribe\n2. Unsubscribe\n3. Exit";
        let action = "mt-cont";

        // Simple USSD Router
        if (message === "1") {
            responseMessage = "You have selected Subscribe. Please wait for confirmation SMS.";
            action = "mt-fin";
            axios.post('http://localhost:4005/api/v1/subscription/subscribe', {
                projectId: app._id,
                msisdn: sourceAddress,
                planId: 'default'
            }, {
                headers: { 'x-user-id': app.developerId }
            }).catch(console.error);
        } else if (message === "2") {
            responseMessage = "You have selected Unsubscribe. Please wait for confirmation SMS.";
            action = "mt-fin";
            axios.post('http://localhost:4005/api/v1/subscription/unsubscribe-by-msisdn', {
                projectId: app._id,
                msisdn: sourceAddress
            }, {
                headers: { 'x-user-id': app.developerId }
            }).catch(console.error);
        } else if (message === "3") {
            responseMessage = "Thank you for using our service.";
            action = "mt-fin";
        } else if (message && message.length > 1) {
            responseMessage = "Invalid option.\n1. Subscribe\n2. Unsubscribe\n3. Exit";
        }

        const payload = {
            applicationId: app.appId,
            password: app.appPassword,
            destinationAddress: sourceAddress,
            message: responseMessage,
            ussdOperation: action,
            sessionId: sessionId
        };

        const bdappsRes = await axios.post(BDAPPS_USSD_API_URL, payload);

        await UssdLog.create({
            projectId: app._id,
            msisdn: sourceAddress,
            sessionId,
            messageReceived: message,
            responseSent: responseMessage,
            action,
            bdappsResponse: bdappsRes.data
        });

        res.status(200).json({ success: true, message: 'USSD Processed', bdappsResponse: bdappsRes.data });
    } catch (error) {
        console.error("USSD Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getUssdLogs = async (req, res) => {
    try {
        const developerId = req.headers['x-user-id'];
        if (!developerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { startDate, endDate, projectId } = req.query;
        let query = {};
        if (projectId) query.projectId = projectId;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }
        
        const logs = await UssdLog.find(query).sort({ createdAt: -1 }).limit(500);
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
