const Application = require('../models/Application');

exports.createApplication = async (req, res) => {
    try {
        const developerId = req.headers['x-user-id'];
        if (!developerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { appType, appId, appPassword, smsKeyword, ussdKeyword, deliveryTime, webUrl } = req.body;

        // Validate required fields based on appType
        if (appType === 'Pro' && !deliveryTime) {
            return res.status(400).json({ success: false, message: 'Delivery time is required for Pro apps.' });
        }

        // Check if appId already exists
        const existingApp = await Application.findOne({ appId });
        if (existingApp) {
            return res.status(400).json({
                success: false,
                message: 'An application with this App Id already exists.'
            });
        }

        const newApp = await Application.create({
            developerId,
            appType,
            appId,
            appPassword,
            smsKeyword,
            ussdKeyword,
            ...(appType === 'Pro' && { deliveryTime }),
            ...(appType === 'Web/Android' && webUrl && { webUrl })
        });

        res.status(201).json({
            success: true,
            data: newApp,
            message: 'Application created successfully'
        });
    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error while creating application'
        });
    }
};

exports.getApplications = async (req, res) => {
    try {
        const developerId = req.headers['x-user-id'];
        if (!developerId) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        const applications = await Application.find({ developerId }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: applications
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error while fetching applications'
        });
    }
};

exports.getApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        res.status(200).json({ success: true, data: application });
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({ success: false, message: 'Server Error while fetching application' });
    }
};

exports.getApplicationByAppId = async (req, res) => {
    try {
        const application = await Application.findOne({ appId: req.params.appId });
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        res.status(200).json({ success: true, data: application });
    } catch (error) {
        console.error('Error fetching application by appId:', error);
        res.status(500).json({ success: false, message: 'Server Error while fetching application' });
    }
};

exports.updateApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { appType, appId, appPassword, smsKeyword, ussdKeyword, deliveryTime, webUrl } = req.body;

        const updatedApp = await Application.findByIdAndUpdate(
            id,
            { appType, appId, appPassword, smsKeyword, ussdKeyword, deliveryTime, webUrl },
            { new: true, runValidators: true }
        );

        if (!updatedApp) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.status(200).json({ success: true, data: updatedApp, message: 'Application updated successfully' });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ success: false, message: 'Server Error while updating application' });
    }
};

exports.deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedApp = await Application.findByIdAndDelete(id);

        if (!deletedApp) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.status(200).json({ success: true, message: 'Application deleted successfully' });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ success: false, message: 'Server Error while deleting application' });
    }
};
