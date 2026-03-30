require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const fixIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
        
        await User.syncIndexes();
        console.log('Indexes synced successfully. Old indexes that are not in the schema should be dropped.');
        
        process.exit(0);
    } catch (err) {
        console.error('Error syncing indexes:', err);
        process.exit(1);
    }
};

fixIndexes();
