const mongoose = require('mongoose');

const StockUsageSchema = new mongoose.Schema({
    inventoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: true
    },
    itemName: {
        type: String,
        required: true
    },
    usedQty: {
        type: Number,
        required: true
    },
    remainingStock: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('StockUsage', StockUsageSchema);
