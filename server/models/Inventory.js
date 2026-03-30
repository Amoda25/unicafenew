const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    category: {
        type: String,
        enum: ['Beverage', 'Dairy', 'Pantry', 'Meat', 'Vegetables', 'Other'],
        required: true
    },
    qty: { 
        type: Number, 
        required: true 
    },
    minStockThreshold: { 
        type: Number, 
        default: 10 
    },
    unit: { 
        type: String, 
        required: true 
    },
    expiry: { 
        type: String // We store as YYYY-MM-DD for simplicity in this frontend
    },
    supplier: { 
        type: String 
    },
    status: { 
        type: String, 
        default: 'Good' 
    },
    lastRestocked: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', InventorySchema);
