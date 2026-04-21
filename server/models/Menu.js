const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
    name: {
        en: { type: String, required: true },
        si: { type: String, required: true },
        ta: { type: String, required: true }
    },
    description: {
        en: String,
        si: String,
        ta: String
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: [String],
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Special Menu'],
        required: true
    },
    image: String, // URL or placeholder
    availability: {
        type: Boolean,
        default: true
    },
    dietary: {
        type: [String],
        enum: ['Veg', 'Non-Veg'],
        default: ['Veg']
    },
    availableDays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }
});

module.exports = mongoose.model('Menu', MenuSchema);
