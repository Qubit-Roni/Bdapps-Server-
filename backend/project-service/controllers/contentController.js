const Content = require('../models/Content');
const Application = require('../models/Application');
const axios = require('axios');

exports.createContents = async (req, res) => {
    try {
        const developerId = req.headers['x-user-id'];
        if (!developerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        let contentsToInsert = [];

        // Check if req.body is an array (batch upload format)
        if (Array.isArray(req.body)) {
            contentsToInsert = req.body.map(item => ({
                developerId,
                subKeyword: item.subKeyword || item.App_id,
                date: item.date || item.Date,
                contentBody: item.contentBody || item.Content
            }));
        } 
        // Original format: { subKeyword: '...', contents: [...] }
        else if (req.body.subKeyword && Array.isArray(req.body.contents)) {
            contentsToInsert = req.body.contents.map(item => ({
                developerId,
                subKeyword: req.body.subKeyword,
                date: item.date,
                contentBody: item.contentBody
            }));
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format.'
            });
        }

        // Validate basic fields
        if (contentsToInsert.length === 0) {
            return res.status(400).json({ success: false, message: 'No content to insert' });
        }

        const newContents = await Content.insertMany(contentsToInsert);

        res.status(201).json({
            success: true,
            data: newContents,
            message: 'Contents created successfully'
        });
    } catch (error) {
        console.error('Error creating contents:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error while creating contents'
        });
    }
};

exports.getContents = async (req, res) => {
    try {
        const developerId = req.headers['x-user-id'];
        if (!developerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        // Can add filtering later based on query params
        const contents = await Content.find({ developerId }).sort({ date: -1, createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: contents
        });
    } catch (error) {
        console.error('Error fetching contents:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error while fetching contents'
        });
    }
};

exports.updateContent = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, contentBody, subKeyword } = req.body;

        const updatedContent = await Content.findByIdAndUpdate(
            id,
            { date, contentBody, subKeyword },
            { new: true, runValidators: true }
        );

        if (!updatedContent) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }

        res.status(200).json({ success: true, data: updatedContent });
    } catch (error) {
        console.error('Error updating content:', error);
        res.status(500).json({ success: false, message: 'Server Error while updating content' });
    }
};

exports.deleteContent = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedContent = await Content.findByIdAndDelete(id);

        if (!deletedContent) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }

        res.status(200).json({ success: true, message: 'Content deleted successfully' });
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({ success: false, message: 'Server Error while deleting content' });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const developerId = req.headers['x-user-id'];
        if (!developerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const applications = await Application.find({ developerId });
        
        // Fetch all subscriptions to check for active users
        let activeSubscriptions = [];
        try {
            const subRes = await axios.get('http://localhost:4000/api/v1/subscription/all');
            if (subRes.data && subRes.data.success) {
                // Filter only active subscriptions
                activeSubscriptions = subRes.data.data.filter(sub => sub.status === 'active');
            }
        } catch (err) {
            console.error('Error fetching subscriptions for notifications:', err.message);
        }
        
        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() + 1);
        const tomorrowStr = dateObj.toISOString().split('T')[0];
        
        const notifications = [];

        for (const app of applications) {
            // Check if this app has any active subscribers
            const hasActiveUsers = activeSubscriptions.some(sub => sub.projectId === app.appId);
            
            // Only generate notifications if the app has active users
            if (hasActiveUsers) {
                // Find latest content for this app
                const latestContent = await Content.findOne({ subKeyword: app.appId }).sort({ date: -1 });
                
                if (!latestContent) {
                    notifications.push({
                        appId: app.appId,
                        appName: app.appName || app.appId,
                        message: `No content uploaded for this application.`,
                        type: 'danger'
                    });
                } else if (latestContent.date < tomorrowStr) {
                    notifications.push({
                        appId: app.appId,
                        appName: app.appName || app.appId,
                        message: `Missing content for tomorrow (${tomorrowStr}). Latest uploaded date is ${latestContent.date}.`,
                        type: 'warning'
                    });
                }
            }
        }

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
