require('dotenv').config();
const mongoose = require('mongoose');

const checkUsersFull = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        require('fs').writeFileSync('users_full.json', JSON.stringify(users, null, 2));
        console.log('Users (all fields directly from mongo) saved to users_full.json');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsersFull();
