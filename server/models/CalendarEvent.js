const mongoose = require('mongoose');

const CalendarEventSchema = new mongoose.Schema({
    date: {
        type: String, // Storing as YYYY-MM-DD for easier matching
        required: true
    },
    type: {
        type: String,
        enum: ['closing', 'event', 'admin_note'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema);
