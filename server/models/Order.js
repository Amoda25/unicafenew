const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    username: String,
    items: [{
        name: String,
        quantity: Number,
        price: Number
    }],
    totalAmount: Number,
    status: {
        type: String,
        enum: ['pending', 'preparing', 'process', 'cookd', 'picup', 'picked-up'],
        default: 'pending'
    },
    pickupTime: Date,
    queuePosition: {
        type: Number,
        default: 0
    },
    estimatedWaitTime: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', OrderSchema);
