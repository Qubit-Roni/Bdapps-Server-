const mongoose = require('mongoose');
const User = require('./models/User'); // assuming models/User.js exists

mongoose.connect('mongodb://127.0.0.1:27017/bdapps_auth').then(async () => {
    try {
        const existingAdmin = await User.findOne({ email: 'admin@bdapps.com' });
        if (existingAdmin) {
            console.log('Admin already exists.');
        } else {
            const admin = new User({
                name: 'Admin',
                phone: '01700000000',
                email: 'admin@bdapps.com',
                password: 'password123',
                role: 'admin',
                status: 'active'
            });
            await admin.save();
            console.log('Admin user created: admin@bdapps.com / password123');
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}).catch(console.error);
