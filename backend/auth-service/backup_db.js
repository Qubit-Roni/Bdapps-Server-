const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const backupDir = path.join(__dirname, '..', 'backups', new Date().toISOString().split('T')[0]);


async function backupDatabase() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error("❌ Error: MONGO_URI is missing. Please add it to your environment variables or backend/auth-service/.env file.");
        process.exit(1);
    }

    try {
        console.log("⏳ Connecting to MongoDB Atlas...");
        await mongoose.connect(uri);
        console.log("✅ Connected successfully!");

        if (!fs.existsSync(backupDir)){
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const collections = await mongoose.connection.db.collections();
        console.log(`📁 Found ${collections.length} collections. Starting backup...`);

        for (let collection of collections) {
            const data = await collection.find({}).toArray();
            const filePath = path.join(backupDir, `${collection.collectionName}.json`);
            
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`✔️  Backed up ${collection.collectionName} (${data.length} documents)`);
        }

        console.log(`\n🎉 Backup Complete! All data saved securely to: ${backupDir}`);
    } catch (error) {
        console.error("❌ Error during backup:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

backupDatabase();
