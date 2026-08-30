const cron = require('node-cron');
const axios = require('axios');
const Application = require('../models/Application');
const Content = require('../models/Content');

const initScheduler = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            // Get current time in Bangladesh (Asia/Dhaka)
            const now = new Date();
            const bdTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
            
            let hours24 = bdTime.getHours();
            const minutes = bdTime.getMinutes().toString().padStart(2, '0');
            const ampm = hours24 >= 12 ? 'PM' : 'AM';
            let hours12 = hours24 % 12;
            hours12 = hours12 ? hours12 : 12; // the hour '0' should be '12'
            const currentTimeStr = `${hours12}:${minutes} ${ampm}`;
            
            const year = bdTime.getFullYear();
            const month = (bdTime.getMonth() + 1).toString().padStart(2, '0');
            const day = bdTime.getDate().toString().padStart(2, '0');
            const currentDateStr = `${year}-${month}-${day}`;
            
            console.log(`[Cron] Checking scheduled contents - Time: ${currentTimeStr} Date: ${currentDateStr}`);

            // Find apps where deliveryTime is the current time
            const appsToDeliver = await Application.find({ deliveryTime: currentTimeStr });
            
            for (const app of appsToDeliver) {
                // Application's appId corresponds to Content's subKeyword
                const pendingContents = await Content.find({
                    subKeyword: app.appId,
                    date: currentDateStr,
                    status: 'pending'
                });

                if (pendingContents.length > 0) {
                    try {
                        // Fetch active subscribers for this app
                        const subRes = await axios.get(`http://localhost:4005/api/v1/subscription/active/${app._id}`);
                        const msisdns = subRes.data.data || [];

                        if (msisdns.length > 0) {
                            for (const content of pendingContents) {
                                try {
                                    // Send bulk SMS
                                    await axios.post('http://localhost:4003/api/v1/sms/bulk-send', {
                                        projectId: app._id,
                                        msisdns: msisdns,
                                        message: content.contentBody
                                    });

                                    // Update content status to success
                                    content.status = 'success';
                                    await content.save();
                                    console.log(`[Cron] Successfully delivered content for ${app.appId}`);
                                } catch (smsErr) {
                                    console.error(`[Cron] Failed to send SMS for ${app.appId}:`, smsErr.message);
                                    content.status = 'failed';
                                    await content.save();
                                }
                            }
                        } else {
                            console.log(`[Cron] No active subscribers for ${app.appId}`);
                            // Mark content as failed since no users received it, or keep it pending?
                            // Let's mark as success to not retry tomorrow, or failed.
                            for (const content of pendingContents) {
                                content.status = 'failed';
                                await content.save();
                            }
                        }
                    } catch (err) {
                        console.error(`[Cron] Failed to process delivery for ${app.appId}:`, err.message);
                    }
                }
            }
        } catch (error) {
            console.error('[Cron] Error running scheduler:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Dhaka"
    });
    console.log('[Cron] Content scheduler initialized (Timezone: Asia/Dhaka).');
};

module.exports = initScheduler;
