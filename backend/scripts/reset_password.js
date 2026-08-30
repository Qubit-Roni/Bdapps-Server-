require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const user = await User.findOne({ email: 'ronisikder49@gmail.com' });
        if (user) {
            user.password = 'admin123';
            await user.save();
            console.log('Password reset to admin123');
        } else {
            console.log('User not found');
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}).catch(console.error);
