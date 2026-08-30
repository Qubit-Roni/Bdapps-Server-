require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    console.log('USERS IN DB:');
    console.log(users.map(u => ({ email: u.email, phone: u.phone, role: u.role, status: u.status })));
    process.exit(0);
}).catch(console.error);
