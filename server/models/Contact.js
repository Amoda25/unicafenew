const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    adminReply: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Resolved', 'In Review'],
        default: 'Pending'
    },
    isPriority: {
        type: Boolean,
        default: false
    },
    impactScore: {
        type: Number,
        default: 0
    },
    impactLevel: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Low'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Contact', ContactSchema);
