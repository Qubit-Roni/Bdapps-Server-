const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // To get MONGO_URI if needed, but we'll hardcode just in case

// We can just use the UssdLog model
const UssdLog = require('./models/UssdLog');

async function insertDummy() {
    try {
        const uri = 'mongodb://qubitzonebd_db_user:18UHT5Vf531QhuRd@ac-1frv1kd-shard-00-00.f1jgl4t.mongodb.net:27017,ac-1frv1kd-shard-00-01.f1jgl4t.mongodb.net:27017,ac-1frv1kd-shard-00-02.f1jgl4t.mongodb.net:27017/bdapps_server?ssl=true&replicaSet=atlas-i4xwys-shard-0&authSource=admin&retryWrites=true&w=majority';
        await mongoose.connect(uri);
        
        console.log("Connected. Inserting dummy USSD log...");

        await UssdLog.create({
            projectId: new mongoose.Types.ObjectId(), // Fake Project ID
            msisdn: 'tel:BGD01812345678',
            sessionId: 'dummy_session_999',
            messageReceived: '1',
            responseSent: 'Welcome to Dummy Service',
            action: 'mt-cont',
            bdappsResponse: { status: 'Success', dummy: true }
        });

        console.log("✅ Dummy USSD log inserted successfully!");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        mongoose.disconnect();
    }
}

insertDummy();
