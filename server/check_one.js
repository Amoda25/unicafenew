require('dotenv').config();
const mongoose = require('mongoose');

const checkOne = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = require('./models/User');
        const user = await User.findById('69ad8b24039695420f55e47e').lean();
        console.log('User 69ad8b24039695420f55e47e:', JSON.stringify(user, null, 2));
        
        const user2 = await User.findById('69c77458e1fed7f59f84ffb7').lean();
        console.log('User 69c77458e1fed7f59f84ffb7:', JSON.stringify(user2, null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkOne();
