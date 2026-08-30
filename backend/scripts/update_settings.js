const mongoose = require('mongoose');
const Settings = require('./models/Settings');
require('dotenv').config({ path: '../.env' }); // Assuming .env is one level up or accessible

async function updateDb() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bdapps_server', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('Connected to DB...');
        
        const settings = await Settings.findOne();
        if (settings) {
            settings.messageReceivingUrl = 'https://your-domain.com/api/v1/sms/message-receiving-url';
            settings.ussdReceivingUrl = 'https://your-domain.com/api/v1/ussd/ussd-connection-url';
            settings.subscriptionNotificationUrl = 'https://your-domain.com/api/v1/subscription/subscription-notification-url';
            await settings.save();
            console.log('Settings successfully updated in database!');
        } else {
            console.log('No settings document found in DB.');
        }
        
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

updateDb();
