require('dotenv').config();
const mongoose = require('mongoose');

const fixAdminError = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const usersCol = mongoose.connection.db.collection('users');
        
        // delete the newer admin duplicate (or change username)
        await usersCol.updateOne(
            { _id: new mongoose.Types.ObjectId("69c77458e1fed7f59f84ffb7") },
            { $set: { username: "admin_staff" } }
        );
        
        console.log("Renamed duplicate 'admin' to 'admin_staff'");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixAdminError();
