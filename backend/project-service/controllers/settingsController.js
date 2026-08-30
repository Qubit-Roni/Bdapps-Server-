const Settings = require('../models/Settings');

exports.getIntegrationUrls = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        
        // If settings don't exist yet, create a default one
        if (!settings) {
            settings = new Settings();
            await settings.save();
        } else if (settings.messageReceivingUrl && settings.messageReceivingUrl.includes('rtsquad.com')) {
            // Auto-migrate old database entries
            settings.messageReceivingUrl = 'https://your-domain.com/api/v1/sms/message-receiving-url';
            settings.ussdReceivingUrl = 'https://your-domain.com/api/v1/ussd/ussd-connection-url';
            settings.subscriptionNotificationUrl = 'https://your-domain.com/api/v1/subscription/subscription-notification-url';
            await settings.save();
        }

        res.status(200).json({
            success: true,
            data: {
                allowedHostAddress: settings.allowedHostAddress,
                messageReceivingUrl: settings.messageReceivingUrl,
                ussdReceivingUrl: settings.ussdReceivingUrl,
                subscriptionNotificationUrl: settings.subscriptionNotificationUrl
            }
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// Optional: For future admin panel use to update URLs
exports.updateIntegrationUrls = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        const { allowedHostAddress, messageReceivingUrl, ussdReceivingUrl, subscriptionNotificationUrl } = req.body;
        
        if (allowedHostAddress) settings.allowedHostAddress = allowedHostAddress;
        if (messageReceivingUrl) settings.messageReceivingUrl = messageReceivingUrl;
        if (ussdReceivingUrl) settings.ussdReceivingUrl = ussdReceivingUrl;
        if (subscriptionNotificationUrl) settings.subscriptionNotificationUrl = subscriptionNotificationUrl;

        await settings.save();

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
