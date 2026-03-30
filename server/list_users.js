const mongoose = require('mongoose');
const User = require('./models/User');
const fs = require('fs');
require('dotenv').config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}, 'name username password role');
        const result = users.map(user => ({
            name: user.name,
            username: user.username,
            role: user.role,
            isBcrypt: user.password.startsWith('$2a$') || user.password.startsWith('$2b$')
        }));
        fs.writeFileSync('user_list.json', JSON.stringify(result, null, 2));
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
