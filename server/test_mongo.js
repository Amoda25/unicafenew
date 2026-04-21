const mongoose = require('mongoose');
require('dotenv').config();

const testConnect = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        console.log('Testing connection to:', MONGODB_URI.replace(/:([^@]+)@/, ':****@'));
        await mongoose.connect(MONGODB_URI);
        console.log('SUCCESS: MongoDB Connected');
        process.exit(0);
    } catch (err) {
        console.error('ERROR: Failed to connect to MongoDB');
        console.error(err);
        process.exit(1);
    }
};

testConnect();
