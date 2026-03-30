require('dotenv').config();
const mongoose = require('mongoose');

const checkIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = require('./models/User');
        const indexes = await User.collection.indexes();
        require('fs').writeFileSync('indexes.json', JSON.stringify(indexes, null, 2));
        console.log('Indexes saved to indexes.json');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkIndexes();
