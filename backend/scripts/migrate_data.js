const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './.env' });

async function migrateData() {
    console.log("Starting data migration...");
    
    // The URI in .env points to bdapps_server, but MongoClient can switch databases.
    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    
    try {
        await client.connect();
        console.log("Connected to MongoDB Cluster.");

        const newDb = client.db('bdapps_server');

        // 1. Copy Users (from bdapps_auth)
        const oldUsers = await client.db('bdapps_auth').collection('users').find({}).toArray();
        if (oldUsers.length > 0) {
            // Avoid duplicate key errors if already exists
            const existingUsers = await newDb.collection('users').countDocuments();
            if (existingUsers === 0) {
                await newDb.collection('users').insertMany(oldUsers);
                console.log(`✅ Successfully copied ${oldUsers.length} Users (including Admin).`);
            } else {
                console.log(`⚠️ Users already exist in new DB, skipping copy.`);
            }
        } else {
            console.log("No users found in old DB.");
        }

        // 2. Copy Applications (from bdapps_projects)
        const oldApps = await client.db('bdapps_projects').collection('applications').find({}).toArray();
        if (oldApps.length > 0) {
            const existingApps = await newDb.collection('applications').countDocuments();
            if (existingApps === 0) {
                await newDb.collection('applications').insertMany(oldApps);
                console.log(`✅ Successfully copied ${oldApps.length} Applications.`);
            } else {
                console.log(`⚠️ Applications already exist in new DB, skipping copy.`);
            }
        }

        // 3. Copy Settings (from bdapps_projects)
        const oldSettings = await client.db('bdapps_projects').collection('settings').find({}).toArray();
        if (oldSettings.length > 0) {
            const existingSettings = await newDb.collection('settings').countDocuments();
            if (existingSettings === 0) {
                await newDb.collection('settings').insertMany(oldSettings);
                console.log(`✅ Successfully copied Settings.`);
            }
        }

        console.log("🎉 Data Migration Complete!");
    } catch (err) {
        console.error("Migration Error:", err);
    } finally {
        await client.close();
    }
}

migrateData();
