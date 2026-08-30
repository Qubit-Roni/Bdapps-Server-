const mongoose = require('mongoose');
const Settings = require('./models/Settings');
require('dotenv').config({ path: './.env' });

async function updateDb() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bdapps_server', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('Connected to DB...');
        
        const settings = await Settings.findOne();
        if (settings) {
            // Extract the domain they were using (e.g., Qubit.com)
            let domain = 'your-domain.com';
            if (settings.messageReceivingUrl) {
                try {
                    const url = new URL(settings.messageReceivingUrl);
                    domain = url.hostname;
                } catch(e) {}
            }
            
            // Forcefully update the routes, preserving their domain
            settings.messageReceivingUrl = `https://${domain}/api/v1/sms/message-receiving-url`;
            settings.ussdReceivingUrl = `https://${domain}/api/v1/ussd/ussd-connection-url`;
            settings.subscriptionNotificationUrl = `https://${domain}/api/v1/subscription/subscription-notification-url`;
            
            await settings.save();
            console.log('Settings successfully updated in database! Domain kept as:', domain);
        } else {
            console.log('No settings document found in DB.');
        }
        
    } catch (err) {
        console.error('Mongo Error:', err.message);
    } finally {
        mongoose.connection.close();
    }
}

updateDb();
