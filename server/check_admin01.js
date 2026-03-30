require('dotenv').config();
const mongoose = require('mongoose');

const checkAdmin01 = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = require('./models/User');
        const user = await User.findOne({  $or: [{ username: 'admin01' }, { studentId: 'admin01' }] }).lean();
        console.log('User admin01:', JSON.stringify(user, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkAdmin01();
