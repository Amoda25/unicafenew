require('dotenv').config();
const mongoose = require('mongoose');

const checkInsert = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = require('./models/User');
        
        const user = new User({
            name: "Direct Insert Test",
            username: "DIRECT12345",
            password: "password123",
            role: "student"
        });
        await user.save();
        console.log("Insert success!");
        process.exit(0);
    } catch (err) {
        console.error("Insert Failed!", err);
        process.exit(1);
    }
};

checkInsert();
