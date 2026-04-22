const mongoose = require('mongoose');

const flashDealSchema = new mongoose.Schema({
    itemName:     { type: String, required: true },
    discountPct:  { type: Number, required: true }, // e.g. 10 or 20
    suggestion:   { type: String, required: true },
    promoType:    { type: String, default: 'flash' }, // 'flash' | 'bundle' | 'happyhour'
    urgency:      { type: String, default: 'MED' },   // 'HIGH' | 'MED' | 'LOW'
    expiresAt:    { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24h default
    isActive:     { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('FlashDeal', flashDealSchema);
