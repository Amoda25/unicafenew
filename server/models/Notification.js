const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['order', 'system', 'alert'],
        default: 'order'
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
