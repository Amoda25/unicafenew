require('dotenv').config();
const mongoose = require('mongoose');

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = require('./models/User');
        const users = await User.find({}).select('name username role');
        require('fs').writeFileSync('users.json', JSON.stringify(users, null, 2));
        console.log('Users saved to users.json');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
