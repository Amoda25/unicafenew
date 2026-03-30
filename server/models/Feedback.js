const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    username: String,
    vendorId: String,
    orderId: String,
    category: String,
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    comment: String,
    sentiment: {
        type: String,
        enum: ['Positive', 'Neutral', 'Negative'],
        default: 'Neutral'
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
    coinsEarned: {
        type: Number,
        default: 0
    },
    imageUrl: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
