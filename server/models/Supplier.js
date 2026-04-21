const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contactPerson: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    },
    ordersCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema);
