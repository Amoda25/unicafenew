const mongoose = require('mongoose');

const WasteLogSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    category: {
        type: String,
        required: true
    },
    qty: { 
        type: Number, 
        required: true 
    },
    unit: { 
        type: String, 
        required: true 
    },
    expiry: { 
        type: String
    },
    supplier: { 
        type: String 
    },
    reason: {
        type: String,
        default: 'Expired'
    },
    disposedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('WasteLog', WasteLogSchema);
