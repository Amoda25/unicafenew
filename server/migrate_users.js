require('dotenv').config();
const mongoose = require('mongoose');

const migrateUsers = async () => {
    try {
        console.log("Connecting database...");
        await mongoose.connect(process.env.MONGODB_URI);
        const usersCol = mongoose.connection.db.collection('users');
        
        // Find users with studentId but without username
        const oldUsers = await usersCol.find({ studentId: { $exists: true }, username: { $exists: false } }).toArray();
        let migratedCount = 0;
        
        for (let user of oldUsers) {
            // Update the user: set username to be studentId, and remove studentId
            await usersCol.updateOne(
                { _id: user._id },
                { 
                    $set: { username: user.studentId },
                    $unset: { studentId: "" }
                }
            );
            migratedCount++;
        }
        
        console.log(`Successfully migrated ${migratedCount} old users. They can now login with their old Student IDs.`);
        
        process.exit(0);
    } catch (err) {
        console.error("Migration Failed", err);
        process.exit(1);
    }
};

migrateUsers();
