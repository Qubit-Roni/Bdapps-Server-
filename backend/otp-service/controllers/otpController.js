const OtpLog = require('../models/OtpLog');
const axios = require('axios');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};

exports.sendOtp = async (req, res) => {
    try {
        const { appId, password, msisdn } = req.body;
        
        if (!appId || !password || !msisdn) {
            return res.status(400).json({ success: false, message: 'appId, password, and msisdn are required' });
        }

        // Fetch app by BDApps appId
        let application = null;
        try {
            const appRes = await axios.get(`http://localhost:4002/api/v1/projects/applications/by-app-id/${appId}`);
            if (appRes.data && appRes.data.success) {
                application = appRes.data.data;
            }
        } catch (err) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (!application || application.appPassword !== password) {
            return res.status(401).json({ success: false, message: 'Invalid appId or password' });
        }

        const projectId = application._id;
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

        const log = await OtpLog.create({
            projectId,
            msisdn,
            otpCode,
            expiresAt
        });

        // Call SMS Service to deliver the OTP
        try {
            await axios.post('http://localhost:4003/api/v1/sms/send', {
                projectId,
                msisdn,
                message: `Your verification code is: ${otpCode}. It will expire in 5 minutes.`
            });
        } catch (smsErr) {
            console.error('Failed to send SMS via SMS Service', smsErr.message);
        }

        res.status(200).json({ 
            success: true, 
            message: 'OTP generated and sent via SMS'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { appId, password, msisdn, otpCode, planId } = req.body;
        
        if (!appId || !password || !msisdn || !otpCode) {
            return res.status(400).json({ success: false, message: 'appId, password, msisdn, and otpCode are required' });
        }

        // Fetch app by BDApps appId
        let application = null;
        try {
            const appRes = await axios.get(`http://localhost:4002/api/v1/projects/applications/by-app-id/${appId}`);
            if (appRes.data && appRes.data.success) {
                application = appRes.data.data;
            }
        } catch (err) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (!application || application.appPassword !== password) {
            return res.status(401).json({ success: false, message: 'Invalid appId or password' });
        }

        const projectId = application._id;

        // Find the latest OTP log for this user and app
        const log = await OtpLog.findOne({ projectId, msisdn }).sort({ createdAt: -1 });
        
        if (!log) {
            return res.status(404).json({ success: false, message: 'No OTP request found for this number' });
        }

        if (log.status === 'verified') {
            return res.status(400).json({ success: false, message: 'OTP already verified' });
        }

        if (new Date() > log.expiresAt) {
            log.status = 'expired';
            await log.save();
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }

        if (log.retryCount >= 3) {
            log.status = 'failed';
            await log.save();
            return res.status(400).json({ success: false, message: 'Maximum retry limit reached' });
        }

        if (log.otpCode !== otpCode) {
            log.retryCount += 1;
            await log.save();
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        log.status = 'verified';
        await log.save();

        const developerId = application.developerId;

        // Check current subscription status before trying to subscribe
        let isAlreadySubscribed = false;
        if (developerId) {
            try {
                const statusRes = await axios.get(`http://localhost:4005/api/v1/subscription/status?msisdn=${log.msisdn}&projectId=${log.projectId}`, {
                    headers: { 'x-user-id': developerId }
                });
                if (statusRes.data && statusRes.data.subscription && statusRes.data.subscription.status === 'active') {
                    isAlreadySubscribed = true;
                }
            } catch (err) {
                // Ignore
            }
        }

        let subResult = null;
        let isNewSubscription = false;

        if (!isAlreadySubscribed) {
            try {
                const subRes = await axios.post('http://localhost:4005/api/v1/subscription/subscribe', {
                    projectId: log.projectId,
                    msisdn: log.msisdn,
                    planId: planId || 'default'
                }, {
                    headers: { 'x-user-id': developerId || 'system' }
                });
                subResult = subRes.data;
                isNewSubscription = true;
            } catch (subErr) {
                console.error('Subscription failed after OTP verification', subErr.message);
                return res.status(500).json({ success: false, message: 'OTP verified, but subscription failed.', error: subErr.message });
            }
            
            return res.status(200).json({ 
                success: true, 
                message: 'OTP verified and user subscribed anew successfully', 
                subscriptionData: subResult,
                isNewSubscription: true
            });
        } else {
            return res.status(200).json({ 
                success: true, 
                message: 'OTP verified. User is already subscribed.', 
                isNewSubscription: false
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.getOtpLogs = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {};
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }
        
        const logs = await OtpLog.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
