const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Menu = require('./models/Menu');
const Order = require('./models/Order');
const User = require('./models/User');
const Contact = require('./models/Contact');
const Feedback = require('./models/Feedback');
const CalendarEvent = require('./models/CalendarEvent');
const Inventory = require('./models/Inventory');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretpassword123';

const app = express();
const PORT = process.env.PORT || 5000;

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection string will be used in startServer function
// Password Validation Helper
const isPasswordComplex = (password) => {
    const uppercase = /[A-Z]/.test(password);
    const lowercase = /[a-z]/.test(password);
    const number = /[0-9]/.test(password);
    const special = /[^A-Za-z0-9]/.test(password);
    return password.length >= 8 && uppercase && lowercase && number && special;
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, username, password, role } = req.body;

        // Robust Input Validation
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ message: 'Valid name is required' });
        }
        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            return res.status(400).json({ message: 'Valid username is required' });
        }

        // Student ID Validation (if role is student)
        if (role === 'student') {
            const studentIdRegex = /^[A-Za-z]{2,}\d{5,}$/;
            if (!studentIdRegex.test(username.trim())) {
                return res.status(400).json({ message: 'Invalid Student ID. Use letters followed by digits (e.g., IT123456).' });
            }
        }
        if (!password || typeof password !== 'string' || !isPasswordComplex(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character' });
        }

        // Check if user already exists
        let user = await User.findOne({ username: username.trim() });
        if (user) {
            return res.status(400).json({ message: 'User with this username already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({
            name: name.trim(),
            username: username.trim(),
            password: hashedPassword,
            role: role || 'student'
        });

        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Server Registration Error Details:', {
            message: err.message,
            stack: err.stack,
            name: err.name,
            code: err.code
        });

        // Handle Mongoose uniqueness constraint or other validation errors
        if (err.code === 11000) {
            return res.status(400).json({ message: 'User with this username already exists' });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation failed',
                errors: Object.values(err.errors).map(e => e.message)
            });
        }

        res.status(500).json({
            message: 'An internal server error occurred during registration',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post('/api/auth/google', async (req, res) => {
    try {
        const { tokenId } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { email, name, sub } = payload;

        // Find or create user
        let user = await User.findOne({ username: email }); // Using email as username for Google users
        if (!user) {
            user = new User({
                name,
                username: email,
                password: await bcrypt.hash(sub, 10), // Random password for Google users
                role: 'student'
            });
            await user.save();
        }

        // Create JWT
        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name, username: user.username },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(400).json({ message: 'Google authentication failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT
        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name, username: user.username },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Menu Routes
app.get('/api/menu', async (req, res) => {
    try {
        const menu = await Menu.find({ availability: true });
        res.json(menu);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/menu', async (req, res) => {
    try {
        const newMenuItem = new Menu(req.body);
        const savedMenuItem = await newMenuItem.save();
        res.status(201).json(savedMenuItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Order Routes
app.post('/api/orders', async (req, res) => {
    try {
        // Calculate queue position based on pending/preparing orders
        const activeOrders = await Order.countDocuments({
            status: { $in: ['pending', 'preparing'] }
        });

        // Estimate wait time: 5 mins per order + 10 mins base
        const estimatedWaitTime = (activeOrders * 5) + 10;

        const newOrder = new Order({
            ...req.body,
            queuePosition: activeOrders + 1,
            estimatedWaitTime: estimatedWaitTime
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/orders/all', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/orders/:username', async (req, res) => {
    try {
        const orders = await Order.find({ username: req.params.username }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Queue Status Route
app.get('/api/queue/status', async (req, res) => {
    try {
        const activeOrders = await Order.countDocuments({
            status: { $in: ['pending', 'preparing'] }
        });

        // Calculate average wait time
        const avgWaitTime = (activeOrders * 5) + 10;

        res.json({
            queueLength: activeOrders,
            estimatedWaitTime: avgWaitTime,
            lastUpdated: new Date()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Routes
app.get('/api/admin/stats', async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalMenuItems = await Menu.countDocuments();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = await Order.countDocuments({
            createdAt: { $gte: today }
        });

        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10);

        // Analytics: Most popular items
        const popularItems = await Order.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.name', count: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Weekly trends (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyOrders = await Order.aggregate([
            { $match: { createdAt: { $gte: weekAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Average order value
        const avgOrderValue = totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0;

        res.json({
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalMenuItems,
            todayOrders,
            recentOrders,
            analytics: {
                popularItems,
                weeklyTrends: weeklyOrders,
                avgOrderValue: Math.round(avgOrderValue)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/menu/all', async (req, res) => {
    try {
        const menu = await Menu.find();
        res.json(menu);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/menu/:id', async (req, res) => {
    try {
        const updatedMenu = await Menu.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedMenu) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.json(updatedMenu);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/menu/:id', async (req, res) => {
    try {
        const deletedMenu = await Menu.findByIdAndDelete(req.params.id);
        if (!deletedMenu) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.json({ message: 'Menu item deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// User Management Routes
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclude password from response
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { name, username, password, role } = req.body;

        if (!name || name.trim().length === 0) return res.status(400).json({ message: 'Name is required' });
        if (!username || username.trim().length === 0) return res.status(400).json({ message: 'Username is required' });
        if (!password || !isPasswordComplex(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character' });
        }

        // Student ID Validation (if role is student)
        if (role === 'student') {
            const studentIdRegex = /^[A-Za-z]{2,}\d{5,}$/;
            if (!studentIdRegex.test(username.trim())) {
                return res.status(400).json({ message: 'Invalid Student ID. Use letters followed by digits (e.g., IT123456).' });
            }
        }

        // Check if user exists
        const existingUser = await User.findOne({ username: username.trim() });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            username,
            password: hashedPassword,
            role: role || 'student'
        });

        const savedUser = await newUser.save();

        // Remove password from response
        const userResponse = savedUser.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Contact Message Routes
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/contact', async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/contact/:id/read', async (req, res) => {
    try {
        const msg = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        if (!msg) return res.status(404).json({ error: 'Message not found' });
        res.json(msg);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/contact/:id', async (req, res) => {
    try {
        const deletedMsg = await Contact.findByIdAndDelete(req.params.id);
        if (!deletedMsg) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.json({ message: 'Message deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/contact/:id/reply', async (req, res) => {
    try {
        const { adminReply, status } = req.body;
        const msg = await Contact.findByIdAndUpdate(
            req.params.id, 
            { adminReply, status, isRead: true }, 
            { new: true }
        );
        if (!msg) return res.status(404).json({ error: 'Message not found' });
        res.json(msg);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/contact/:id/priority', async (req, res) => {
    try {
        const { isPriority } = req.body;
        const msg = await Contact.findByIdAndUpdate(req.params.id, { isPriority }, { new: true });
        if (!msg) return res.status(404).json({ error: 'Message not found' });
        res.json(msg);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Image Upload Route
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

// Feedback Routes
app.post('/api/feedback', async (req, res) => {
    try {
        const { username, rating, sentiment, orderId, category, comment, imageUrl } = req.body;

        // Verify if the student has placed at least one order
        const orderCount = await Order.countDocuments({ username });
        if (orderCount === 0) {
            return res.status(403).json({ 
                error: 'Feedback restricted. You must place at least one order before providing feedback.' 
            });
        }

        const newFeedback = new Feedback({ username, rating, sentiment, orderId, category, comment, imageUrl: imageUrl || '' });
        const savedFeedback = await newFeedback.save();
        res.status(201).json(savedFeedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/feedback', async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/feedback/:id', async (req, res) => {
    try {
        const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);
        if (!deletedFeedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        res.json({ message: 'Feedback deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/feedback/:id/reply', async (req, res) => {
    try {
        const { adminReply, status } = req.body;
        const fb = await Feedback.findByIdAndUpdate(
            req.params.id, 
            { adminReply, status }, 
            { new: true }
        );
        if (!fb) return res.status(404).json({ error: 'Feedback not found' });
        res.json(fb);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/feedback/:id/priority', async (req, res) => {
    try {
        const { isPriority } = req.body;
        const fb = await Feedback.findByIdAndUpdate(req.params.id, { isPriority }, { new: true });
        if (!fb) return res.status(404).json({ error: 'Feedback not found' });
        res.json(fb);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Calendar Routes
app.get('/api/calendar/events', async (req, res) => {
    try {
        const events = await CalendarEvent.find().sort({ date: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/calendar/events', async (req, res) => {
    try {
        // Admin check should be here (simplified for now as per instructions)
        const newEvent = new CalendarEvent(req.body);
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/calendar/events/:id', async (req, res) => {
    try {
        const deletedEvent = await CalendarEvent.findByIdAndDelete(req.params.id);
        if (!deletedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Inventory Management Routes
app.get('/api/inventory', async (req, res) => {
    try {
        const inventory = await Inventory.find().sort({ createdAt: -1 });
        res.json(inventory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/inventory', async (req, res) => {
    try {
        const newItem = new Inventory(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/inventory/:id', async (req, res) => {
    try {
        const updatedItem = await Inventory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedItem) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/inventory/:id', async (req, res) => {
    try {
        const deletedItem = await Inventory.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }
        res.json({ message: 'Inventory item deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Basic Route
app.get('/', (req, res) => {
    res.send('University Cafeteria API is running');
});

// Start Server and Connect DB
const startServer = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
};

startServer();
