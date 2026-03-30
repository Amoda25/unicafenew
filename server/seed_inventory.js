const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');
require('dotenv').config();

const initialInventory = [
    { 
        name: 'Premium Coffee Beans', 
        category: 'Beverage', 
        qty: 15, 
        unit: 'kg', 
        minStockThreshold: 20, 
        expiry: '2026-05-22', 
        supplier: 'Global Roasters',
        status: 'Good'
    },
    { 
        name: 'Whole Milk', 
        category: 'Dairy', 
        qty: 45, 
        unit: 'L', 
        minStockThreshold: 10, 
        expiry: '2026-03-28', 
        supplier: 'Local Dairy Farm',
        status: 'Good'
    },
    { 
        name: 'Sugar', 
        category: 'Pantry', 
        qty: 50, 
        unit: 'kg', 
        minStockThreshold: 10, 
        expiry: '2027-03-23', 
        supplier: 'Sweet Co.',
        status: 'Good'
    },
    { 
        name: 'Flour', 
        category: 'Pantry', 
        qty: 8, 
        unit: 'kg', 
        minStockThreshold: 25, 
        expiry: '2026-09-19', 
        supplier: 'Millers Hub',
        status: 'Good'
    },
    { 
        name: 'Butter', 
        category: 'Dairy', 
        qty: 5, 
        unit: 'kg', 
        minStockThreshold: 15, 
        expiry: '2026-04-12', 
        supplier: 'Local Dairy Farm',
        status: 'Good'
    }
];

const seedInventory = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if data already exists to avoid duplicates
        const count = await Inventory.countDocuments();
        if (count > 0) {
            console.log('Inventory already has data. Skipping seeding.');
            process.exit(0);
        }

        await Inventory.insertMany(initialInventory);
        console.log('Successfully seeded initial inventory items!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding inventory:', err);
        process.exit(1);
    }
};

seedInventory();
