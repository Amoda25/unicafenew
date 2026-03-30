const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({}, 'name username password role');
        console.log('Total users:', users.length);
        
        users.forEach(user => {
            console.log('-------------------');
            console.log('Name:', user.name);
            console.log('Username:', user.username);
            console.log('Role:', user.role);
            console.log('Password hash:', user.password.substring(0, 10) + '...');
            console.log('Is valid bcrypt hash:', user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
};

checkUsers();
