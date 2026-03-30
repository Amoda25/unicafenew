import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save,
    ShoppingBag, DollarSign, Package, TrendingUp, Clock,
    Award, BarChart3, Sparkles, Utensils, ClipboardList,
    MessageSquare, Users as UsersIcon, Settings as SettingsIcon,
    AlertTriangle, Calendar, FileText, Filter, Star, Smile, AlertCircle, ThumbsUp, UserCircle, Search,
    Zap, ShieldAlert, LogOut, Download, Activity, ExternalLink,
    Store, Bell, MapPin, Grid, BarChart2, Briefcase, Plus, X, AlignLeft,
    Monitor, CheckSquare, Layers, Lock, CreditCard, Camera, Info, Type, Mail, Link as LinkIcon, Edit2, Trash2, StopCircle, CornerUpRight, Play, ArrowLeft
} from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatsCard from '../components/StatsCard';
import PopularItems from '../components/PopularItems';
import AIAssistant from '../components/AIAssistant';

const AdminPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalMenuItems: 0, todayOrders: 0, analytics: { popularItems: [], weeklyTrends: [], avgOrderValue: 0 } });
    const [menuItems, setMenuItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [contactMessages, setContactMessages] = useState([]);
    const [globalSearch, setGlobalSearch] = useState('');
    const [showUserModal, setShowUserModal] = useState(false);
    const [userFormData, setUserFormData] = useState({
        name: '',
        username: '',
        password: '',
        role: 'student'
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showSuccess, setShowSuccess] = useState('');
    const [showError, setShowError] = useState('');
    const [showDailyReport, setShowDailyReport] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    const validatePassword = (pass) => {
        setPasswordRequirements({
            length: pass.length >= 8,
            uppercase: /[A-Z]/.test(pass),
            lowercase: /[a-z]/.test(pass),
            number: /[0-9]/.test(pass),
            special: /[^A-Za-z0-9]/.test(pass)
        });
    };

    // Inventory State
    const [inventoryTab, setInventoryTab] = useState('stock'); // stock, suppliers, reports
    const [showStockModal, setShowStockModal] = useState(false);
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [formData, setFormData] = useState({
        name: { en: '', si: '', ta: '' },
        description: { en: '', si: '', ta: '' },
        price: '',
        category: 'Breakfast',
        image: '',
        isVeg: false,
        availability: true
    });

    const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'];
    const statuses = ['pending', 'preparing', 'ready', 'picked-up'];

    useEffect(() => {
        fetchStats();
        fetchMenuItems();
        fetchOrders();
        fetchUsers();
        fetchContactMessages();

        // Set up real-time polling for dashboard cards
        const intervalId = setInterval(() => {
            fetchStats();
            fetchUsers();
            fetchOrders();
        }, 5000); // Refresh every 5 seconds

        return () => clearInterval(intervalId);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/admin/stats');
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchMenuItems = async () => {
        try {
            const response = await axios.get('/api/menu/all');
            setMenuItems(response.data);
        } catch (err) {
            console.error('Error fetching menu:', err);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/api/orders/all');
            setOrders(response.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const fetchContactMessages = async () => {
        setIsRefreshing(true);
        try {
            const response = await axios.get('/api/contact');
            setContactMessages(response.data);
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setTimeout(() => setIsRefreshing(false), 500); // 500ms delay for visual feedback
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await axios.put(`/api/contact/${id}/read`);
            fetchContactMessages();
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const handleDeleteContactMessage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            await axios.delete(`/api/contact/${id}`);
            fetchContactMessages();
        } catch (err) {
            console.error('Error deleting message:', err);
        }
    };

    const handleInputChange = (field, lang, value) => {
        if (lang) {
            setFormData({ ...formData, [field]: { ...formData[field], [lang]: value } });
        } else {
            setFormData({ ...formData, [field]: value });
        }
    };

    const resetForm = () => {
        setFormData({
            name: { en: '', si: '', ta: '' },
            description: { en: '', si: '', ta: '' },
            price: '',
            category: 'Breakfast',
            image: '',
            isVeg: false,
            availability: true
        });
        setUserFormData({
            name: '',
            username: '',
            password: '',
            role: 'student'
        });
        setPasswordRequirements({
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false
        });
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/menu', formData);
            setShowSuccess('Item added successfully!');
            setShowAddModal(false);
            resetForm();
            fetchMenuItems();
            fetchStats();
        } catch (err) {
            console.error('Error adding item:', err);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();

        // Password Validation
        const isPasswordValid = Object.values(passwordRequirements).every(req => req);
        if (!isPasswordValid) {
            setShowError('Password requirements not met! Please check the guidelines.');
            setTimeout(() => setShowError(''), 4000);
            return;
        }

        try {
            await axios.post('/api/users', userFormData);
            setShowSuccess('User added successfully!');
            fetchUsers();
            setShowUserModal(false);
            resetForm();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`/api/users/${userId}`);
            setShowSuccess('User deleted successfully!');
            fetchUsers();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`/api/users/${userId}/role`, { role: newRole });
            setShowSuccess('User role updated!');
            fetchUsers();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            alert('Failed to update user role');
        }
    };

    const handleEditItem = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/menu/${editingItem._id}`, formData);
            setShowSuccess('Item updated successfully!');
            setShowEditModal(false);
            setEditingItem(null);
            resetForm();
            fetchMenuItems();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            alert('Failed to update item');
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await axios.delete(`/api/menu/${id}`);
            setShowSuccess('Item deleted successfully!');
            fetchMenuItems();
            fetchStats();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            alert('Failed to delete item');
        }
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            image: item.image,
            isVeg: item.isVeg,
            availability: item.availability
        });
        setShowEditModal(true);
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
            setShowSuccess('Order status updated!');
            fetchOrders();
            fetchStats();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            alert('Failed to update order status');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel/delete this order?')) return;
        try {
            await axios.delete(`/api/orders/${orderId}`);
            setShowSuccess('Order deleted successfully!');
            fetchOrders();
            fetchStats();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            alert('Failed to delete order');
        }
    };

    const StatCard = ({ icon: Icon, title, value, color }) => (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{title}</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{value}</div>
                </div>
                <div style={{ padding: '0.75rem', borderRadius: '12px', background: `${color}20` }}>
                    <Icon size={24} style={{ color }} />
                </div>
            </div>
        </div>
    );

    const StockFormModal = ({ show, onClose, title }) => (
        <AnimatePresence>
            {show && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1001 }}
                    />
                    <div
                        style={{ position: 'fixed', top: 0, left: '280px', right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002, pointerEvents: 'none', padding: '20px' }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{ 
                                pointerEvents: 'auto',
                                width: '100%', 
                                maxWidth: '750px', 
                                maxHeight: '90vh', 
                                overflowY: 'auto', 
                                background: 'white', 
                                borderRadius: '24px', 
                                padding: '2.5rem', 
                                border: '1px solid #f1f5f9', 
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' 
                            }}
                        >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{title}</h2>
                            <X onClick={onClose} style={{ cursor: 'pointer', color: 'var(--text-main)' }} />
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); onClose(); setShowSuccess('Stock updated successfully!'); setTimeout(() => setShowSuccess(''), 3000); }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Item Name</label>
                                <input required placeholder="e.g. Basmati Rice" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'white', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</label>
                                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'white', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }}>
                                        <option>Vegetables</option>
                                        <option>Meat</option>
                                        <option>Dairy</option>
                                        <option>Dry Goods</option>
                                        <option>Condiments</option>
                                        <option>Beverages</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Supplier</label>
                                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'white', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }}>
                                        <option>Lanka Foods</option>
                                        <option>Fresh Meats Co</option>
                                        <option>Agro Distributors</option>
                                        <option>Daily Farms</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Quantity</label>
                                    <input required type="number" placeholder="0" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'white', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Unit</label>
                                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'white', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }}>
                                        <option>kg</option>
                                        <option>g</option>
                                        <option>liters</option>
                                        <option>ml</option>
                                        <option>pieces</option>
                                        <option>boxes</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Min Alert Threshold</label>
                                    <input required type="number" placeholder="e.g. 5" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'white', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '2.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Expiry Date</label>
                                <input required type="date" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'white', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }} />
                            </div>
                            <button type="submit" className="btn-premium" style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                <Save size={20} /> Save Stock Item
                            </button>
                        </form>
                    </motion.div>
                </div>
                </>
            )}
        </AnimatePresence>
    );

    const UserFormModal = () => (
        <AnimatePresence>
            {showUserModal && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setShowUserModal(false); resetForm(); }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1001 }}
                    />
                    <div
                        style={{ position: 'fixed', top: 0, left: '280px', right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002, pointerEvents: 'none', padding: '20px' }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{ 
                                pointerEvents: 'auto',
                                width: '100%', 
                                maxWidth: '500px', 
                                background: 'white', 
                                borderRadius: '24px', 
                                padding: '2.5rem', 
                                zIndex: 1002, 
                                border: '1px solid #f1f5f9', 
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' 
                            }}
                        >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>Add New User</h2>
                            <X onClick={() => { setShowUserModal(false); resetForm(); }} style={{ cursor: 'pointer', color: 'var(--text-main)' }} />
                        </div>
                        <form onSubmit={handleAddUser}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                                <input required value={userFormData.name} onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'white', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }} placeholder="e.g. John Doe" />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Student/Staff ID (Username)</label>
                                <input required value={userFormData.username} onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'white', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }} placeholder="e.g. IT2100000" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
                                    <input required type="password" value={userFormData.password} onChange={(e) => { setUserFormData({ ...userFormData, password: e.target.value }); validatePassword(e.target.value); }} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'white', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }} placeholder="********" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</label>
                                    <select value={userFormData.role} onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'white', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }}>
                                        <option value="student">Student</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ 
                                background: '#f8fafc', 
                                padding: '1rem', 
                                borderRadius: '12px', 
                                marginBottom: '1.5rem',
                                fontSize: '0.75rem',
                                border: '1px solid #e2e8f0'
                            }}>
                                <p style={{ fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Password Requirements:</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    {[
                                        { key: 'length', text: '8+ Characters' },
                                        { key: 'uppercase', text: 'Uppercase Letter' },
                                        { key: 'lowercase', text: 'Lowercase Letter' },
                                        { key: 'number', text: 'At least one Number' },
                                        { key: 'special', text: 'Special Character' }
                                    ].map(req => (
                                        <div key={req.key} style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '6px',
                                            color: passwordRequirements[req.key] ? '#10b981' : '#fca5a5',
                                            fontWeight: passwordRequirements[req.key] ? 700 : 500,
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <div style={{ 
                                                width: '6px', 
                                                height: '6px', 
                                                borderRadius: '50%', 
                                                background: passwordRequirements[req.key] ? '#10b981' : '#fca5a5' 
                                            }} />
                                            {req.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="btn-premium" style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                <Save size={20} /> Create User
                            </button>
                        </form>
                    </motion.div>
                </div>
                </>
            )}
        </AnimatePresence>
    );


    // Menu management is now handled in MenuManagement.jsx

    const renderOrderManager = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Order Queue <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>({orders.length} active)</span></h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {statuses.map(status => (
                        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: status === 'ready' ? '#10b981' :
                                    status === 'preparing' ? '#f59e0b' :
                                        status === 'pending' ? '#fbbf24' : '#64748b'
                            }} />
                            {status.toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ padding: '32px', borderRadius: '24px', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                    <thead>
                        <tr style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>
                            <th style={{ padding: '0 16px', textAlign: 'left' }}>Que #</th>
                            <th style={{ padding: '0 16px', textAlign: 'left' }}>Student Details</th>
                            <th style={{ padding: '0 16px', textAlign: 'left' }}>Order Content</th>
                            <th style={{ padding: '0 16px', textAlign: 'left' }}>Current Status</th>
                            <th style={{ padding: '0 16px', textAlign: 'right' }}>Update</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.filter(order => (order._id?.toLowerCase() || '').includes(globalSearch.toLowerCase()) || (order.username?.toLowerCase() || '').includes(globalSearch.toLowerCase())).map(order => (
                            <tr key={order._id} style={{ background: '#f8fafc', borderBottom: '4px solid white' }}>
                                <td style={{ padding: '20px 16px', borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>#{order.queuePosition}</div>
                                </td>
                                <td style={{ padding: '20px 16px' }}>
                                    <div style={{ fontWeight: 700 }}>{order.username}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Placed at {new Date(order.createdAt).toLocaleTimeString()}</div>
                                </td>
                                <td style={{ padding: '20px 16px' }}>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {order.items?.map((item, i) => (
                                            <span key={i} style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px', background: '#e2e8f0', color: '#1e293b', fontWeight: 600 }}>
                                                {item.quantity}x {item.name?.en}
                                            </span>
                                        ))}
                                    </div>
                                    <div style={{ fontWeight: 800, marginTop: '8px', fontSize: '0.875rem' }}>LKR {order.totalAmount}</div>
                                </td>
                                <td style={{ padding: '20px 16px' }}>
                                    <span style={{
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        background: order.status === 'ready' ? 'rgba(16, 185, 129, 0.1)' :
                                            order.status === 'preparing' ? 'rgba(245, 158, 11, 0.1)' :
                                                order.status === 'pending' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                                        color: order.status === 'ready' ? '#10b981' :
                                            order.status === 'preparing' ? '#f59e0b' :
                                                order.status === 'pending' ? '#fbbf24' : '#64748b',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <Clock size={12} />
                                        {order.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '20px 16px', textAlign: 'right', borderTopRightRadius: '16px', borderBottomRightRadius: '16px' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                            style={{
                                                padding: '10px',
                                                borderRadius: '10px',
                                                background: '#f8fafc',
                                                border: '1px solid #cbd5e1',
                                                color: '#1f2937',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                                        </select>
                                        <button
                                            onClick={() => handleDeleteOrder(order._id)}
                                            className="glass"
                                            style={{ padding: '10px', borderRadius: '10px', background: 'white', color: '#ef4444', border: '1px solid #fca5a5', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );





    const renderUserManager = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>User Management <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>({users.length} users)</span></h3>
                <button onClick={() => setShowUserModal(true)} className="btn-premium" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
                    <Plus size={18} /> Add New User
                </button>
            </div>

            <div style={{ padding: '32px', borderRadius: '24px', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>
                                <th style={{ padding: '16px', textAlign: 'left' }}>User ID</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Role</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Registered date</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.filter(user => (user.name?.toLowerCase() || '').includes(globalSearch.toLowerCase()) || (user.username?.toLowerCase() || '').includes(globalSearch.toLowerCase()) || (user.role?.toLowerCase() || '').includes(globalSearch.toLowerCase())).map((user) => (
                                <tr key={user._id} style={{ background: '#f8fafc', borderRadius: '12px' }}>
                                    <td style={{ padding: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{user.username}</td>
                                    <td style={{ padding: '16px' }}>{user.name}</td>
                                    <td style={{ padding: '16px' }}>
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                background: user.role === 'admin' ? 'rgba(139, 92, 246, 0.1)' : (user.role === 'staff' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)'),
                                                color: user.role === 'admin' ? '#8b5cf6' : (user.role === 'staff' ? '#f59e0b' : '#3b82f6'),
                                                textTransform: 'capitalize',
                                                border: '1px solid currentColor',
                                                cursor: 'pointer',
                                                outline: 'none',
                                                appearance: 'none'
                                            }}
                                            title="Change role"
                                        >
                                            <option value="student">Student</option>
                                            <option value="staff">Staff</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button onClick={() => handleDeleteUser(user._id)} className="glass" style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }} title="Delete User">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderInventoryManager = () => {
        const mockStock = [
            { id: 1, name: 'Premium Cheese', category: 'Dairy', quantity: 2, unit: 'kg', minThreshold: 5, expiry: '2026-03-15', supplier: 'Lanka Foods' },
            { id: 2, name: 'Chicken Breast', category: 'Meat', quantity: 15, unit: 'kg', minThreshold: 10, expiry: '2026-03-10', supplier: 'Fresh Meats Co' },
            { id: 3, name: 'Basmati Rice', category: 'Dry Goods', quantity: 50, unit: 'kg', minThreshold: 20, expiry: '2026-12-01', supplier: 'Agro Distributors' },
            { id: 4, name: 'Tomato Sauce', category: 'Condiments', quantity: 4, unit: 'liters', minThreshold: 5, expiry: '2026-06-20', supplier: 'Lanka Foods' },
            { id: 5, name: 'Fresh Milk', category: 'Dairy', quantity: 20, unit: 'liters', minThreshold: 15, expiry: '2026-03-09', supplier: 'Daily Farms' },
        ];

        const getStatusColor = (item) => {
            const daysToExpiry = (new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24);
            if (item.quantity <= item.minThreshold) return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', text: 'Low Stock' };
            if (daysToExpiry <= 3) return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', text: 'Expiring Soon' };
            return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', text: 'Healthy' };
        };

        const lowStockCount = mockStock.filter(item => item.quantity <= item.minThreshold).length;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Inventory & Stock</h3>
                    {lowStockCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', fontWeight: 700 }}>
                            <AlertTriangle size={18} /> {lowStockCount} Items Low on Stock!
                        </div>
                    )}
                </div>

                {/* Sub Navigation */}
                <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
                    {['stock', 'suppliers', 'reports'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setInventoryTab(tab)}
                            style={{
                                padding: '8px 24px',
                                borderRadius: '99px',
                                background: inventoryTab === tab ? 'var(--primary)' : 'transparent',
                                color: inventoryTab === tab ? 'white' : 'var(--text-secondary)',
                                border: 'none',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {inventoryTab === 'stock' && (
                    <div style={{ padding: '32px', borderRadius: '24px', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ position: 'relative' }}>
                                    <Filter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input type="text" placeholder="Search items..." style={{ padding: '10px 10px 10px 40px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--bg-page)', color: 'var(--text-main)', width: '250px' }} />
                                </div>
                            </div>
                            <button onClick={() => setShowStockModal(true)} className="btn-premium" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
                                <Plus size={18} /> Add Stock Item
                            </button>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                <thead>
                                    <tr style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>
                                        <th style={{ padding: '16px', textAlign: 'left' }}>Item Name</th>
                                        <th style={{ padding: '16px', textAlign: 'left' }}>Category</th>
                                        <th style={{ padding: '16px', textAlign: 'right' }}>Quantity</th>
                                        <th style={{ padding: '16px', textAlign: 'left' }}>Expiry Date</th>
                                        <th style={{ padding: '16px', textAlign: 'left' }}>Supplier</th>
                                        <th style={{ padding: '16px', textAlign: 'center' }}>Status</th>
                                        <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockStock.map((item) => {
                                        const status = getStatusColor(item);
                                        return (
                                            <tr key={item.id} style={{ background: 'rgba(59, 10, 0, 0.03)', borderRadius: '12px' }}>
                                                <td style={{ padding: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</td>
                                                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{item.category}</td>
                                                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 800, color: item.quantity <= item.minThreshold ? '#ef4444' : 'var(--text-main)' }}>
                                                    {item.quantity} {item.unit}
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                                                        <Calendar size={14} /> {item.expiry}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{item.supplier}</td>
                                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                                    <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, background: status.bg, color: status.color }}>
                                                        {status.text}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button className="glass" style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button className="glass" style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {inventoryTab === 'suppliers' && (
                    <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '24px' }}>
                        <UsersIcon size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Supplier Management</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Manage contacts, view supplier history, and generate purchase orders.</p>
                        <button className="btn-premium" style={{ padding: '10px 24px' }}>Add New Supplier</button>
                    </div>
                )}

                {inventoryTab === 'reports' && (
                    <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '24px' }}>
                        <FileText size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Inventory Reports</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Generate daily, weekly, or monthly reports on stock consumption and wastage.</p>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                            <button className="btn-premium" style={{ padding: '10px 24px', background: 'var(--bg-page)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}>View Daily Waste</button>
                            <button className="btn-premium" style={{ padding: '10px 24px' }}>Generate Full Report</button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

        // Removed renderMessagesManager as it sits in FeedbackManagement.jsx now

    const renderHub = () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '20px' }}>
            <div className="admin-hub-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '30px', 
                width: '100%', 
                maxWidth: '1200px' 
            }}>
                
                {/* Card 1: Inventory Management (Indigo) */}
                <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/ims')}
                    style={{
                        background: 'linear-gradient(135deg, #4b2e20 0%, #2f2119 100%)',
                        padding: '40px',
                        borderRadius: '32px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        boxShadow: '0 20px 40px rgba(47, 33, 25, 0.45)',
                        color: '#f8efe7',
                        cursor: 'pointer',
                        minHeight: '240px',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid rgba(214,176,140,0.15)'
                    }}
                >
                    <div style={{
                        width: '70px', height: '70px',
                        background: 'rgba(214,176,140,0.2)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '22px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '20px',
                        border: '1px solid rgba(214,176,140,0.3)'
                    }}>
                        <Package size={36} color="#d6b08c" strokeWidth={1.5} />
                    </div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px', lineHeight: 1.1, letterSpacing: '-0.5px', color: '#f8efe7' }}>Inventory<br/>Control</div>
                        <div style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(248,239,231,0.75)' }}>Manage complete stock & supply chain</div>
                    </div>
                    <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.08 }}>
                        <Package size={140} color="#d6b08c" />
                    </div>
                </motion.div>

                {/* Card 2: Order Management — Medium Coffee + Highlight */}
                <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/orders?tab=orders')}
                    style={{
                        background: 'linear-gradient(135deg, #6f4e37 0%, #4b2e20 100%)',
                        padding: '40px',
                        borderRadius: '32px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        boxShadow: '0 20px 40px rgba(111, 78, 55, 0.4)',
                        color: '#f8efe7',
                        cursor: 'pointer',
                        minHeight: '240px',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid rgba(214,176,140,0.15)'
                    }}
                >
                    <div style={{
                        width: '70px', height: '70px',
                        background: 'rgba(214,176,140,0.2)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '22px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '20px',
                        border: '1px solid rgba(214,176,140,0.3)'
                    }}>
                        <ClipboardList size={36} color="#d6b08c" strokeWidth={1.5} />
                    </div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px', lineHeight: 1.1, letterSpacing: '-0.5px', color: '#f8efe7' }}>Order<br/>Management</div>
                        <div style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(248,239,231,0.75)' }}>{stats.totalOrders || 0} active orders in queue</div>
                    </div>
                    <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.08 }}>
                        <ClipboardList size={140} color="#d6b08c" />
                    </div>
                </motion.div>

                {/* Card 3: Feedback Management (Emerald) */}
                <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/feedback-admin')}
                    style={{
                        background: 'linear-gradient(135deg, #8b6b57 0%, #6f4e37 100%)',
                        padding: '40px',
                        borderRadius: '32px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        boxShadow: '0 20px 40px rgba(139, 107, 87, 0.4)',
                        color: '#f8efe7',
                        cursor: 'pointer',
                        minHeight: '240px',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid rgba(214,176,140,0.15)'
                    }}
                >
                    <div style={{
                        width: '70px', height: '70px',
                        background: 'rgba(214,176,140,0.2)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '22px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '20px',
                        border: '1px solid rgba(214,176,140,0.3)'
                    }}>
                        <MessageSquare size={36} color="#d6b08c" strokeWidth={1.5} />
                    </div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px', lineHeight: 1.1, letterSpacing: '-0.5px', color: '#f8efe7' }}>Customer<br/>Feedback</div>
                        <div style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(248,239,231,0.75)' }}>Check user reviews & suggestions</div>
                    </div>
                    <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.08 }}>
                        <MessageSquare size={140} color="#d6b08c" />
                    </div>
                </motion.div>

                {/* Card 4: Sales Management — Warm Highlight / Latte */}
                <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/sales')}
                    style={{
                        background: 'linear-gradient(135deg, #d6b08c 0%, #b8895a 100%)',
                        padding: '40px',
                        borderRadius: '32px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        boxShadow: '0 20px 40px rgba(214, 176, 140, 0.4)',
                        color: '#2f2119',
                        cursor: 'pointer',
                        minHeight: '240px',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.3)'
                    }}
                >
                    <div style={{
                        width: '70px', height: '70px',
                        background: 'rgba(47,33,25,0.15)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '22px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '20px',
                        border: '1px solid rgba(47,33,25,0.2)'
                    }}>
                        <BarChart3 size={36} color="#2f2119" strokeWidth={1.5} />
                    </div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px', lineHeight: 1.1, letterSpacing: '-0.5px', color: '#2f2119' }}>Sales<br/>Analytics</div>
                        <div style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(47,33,25,0.7)' }}>Deep dive into revenue reports</div>
                    </div>
                    <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }}>
                        <BarChart3 size={140} color="#2f2119" />
                    </div>
                </motion.div>

            </div>
        </div>
    );


        // Removed renderAnalytics as it sits in SalesManagement.jsx now

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            background: 'var(--bg-page)',
            color: 'var(--text-main)',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Global Header is rendered by App.jsx */}
            
            <main style={{
                flex: 1,
                padding: '40px',
                position: 'relative',
                scrollBehavior: 'smooth'
            }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Main Content Area */}
                <div style={{ position: 'relative', padding: '20px' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'dashboard' && renderHub()}

                            {/* Daily Sales Report Modal */}
                            <AnimatePresence>
                                {showDailyReport && (
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                                        <motion.div 
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            onClick={() => setShowDailyReport(false)}
                                            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                            className="glass"
                                            style={{
                                                width: '100%', maxWidth: '800px', background: 'white', borderRadius: '32px', position: 'relative', zIndex: 1, overflow: 'hidden',
                                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                                            }}
                                        >
                                            {/* Header */}
                                            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '40px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                    <div style={{ width: 60, height: 60, borderRadius: '20px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <FileText size={32} />
                                                    </div>
                                                    <div>
                                                        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900 }}>Daily Sales Report</h2>
                                                        <p style={{ margin: '5px 0 0', opacity: 0.7, fontWeight: 500 }}>{new Date(selectedReportDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => setShowDailyReport(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: 44, height: 44, borderRadius: '15px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <X size={24} />
                                                </button>
                                            </div>

                                            {/* Body */}
                                            <div style={{ padding: '40px' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                                                    <div style={{ padding: '25px', borderRadius: '24px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Total Revenue</div>
                                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>LKR 42,500</div>
                                                    </div>
                                                    <div style={{ padding: '25px', borderRadius: '24px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Total Orders</div>
                                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>128</div>
                                                    </div>
                                                    <div style={{ padding: '25px', borderRadius: '24px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Avg. Order</div>
                                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>LKR 332</div>
                                                    </div>
                                                </div>

                                                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px' }}>Top Selling Items (Performance)</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                    {[
                                                        { name: 'Chicken Burger', sales: 45, revenue: 15750 },
                                                        { name: 'Iced Coffee', sales: 38, revenue: 7600 },
                                                        { name: 'Cheese Pasta', sales: 22, revenue: 11000 }
                                                    ].map((item, i) => (
                                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 25px', borderRadius: '18px', background: '#ffffff', border: '1px solid #f1f5f9' }}>
                                                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{item.name}</span>
                                                            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                                                                <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>{item.sales} sold</span>
                                                                <span style={{ fontWeight: 800, color: '#10b981' }}>LKR {item.revenue.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
                                                    <button style={{ flex: 1, padding: '16px', borderRadius: '16px', background: '#ff9f43', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                                        <Download size={18} /> Download Detailed PDF
                                                    </button>
                                                    <button onClick={() => setShowDailyReport(false)} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: '#f1f5f9', color: '#64748b', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                                                        Dismiss Report
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>
                            {activeTab === 'messages' && renderMessagesManager()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <AIAssistant />

            {/* Modals and Toasts */}
            <StockFormModal show={showStockModal} onClose={() => setShowStockModal(false)} title="Add/Edit Stock Item" />
            <UserFormModal />

            {showSuccess && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#10b981', padding: '16px 25px', borderRadius: '16px', color: 'white', fontWeight: 700, zIndex: 3000, boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ThumbsUp size={18} />
                        {showSuccess}
                    </div>
                </motion.div>
            )}

            {showError && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#ef4444', padding: '16px 25px', borderRadius: '16px', color: 'white', fontWeight: 700, zIndex: 3000, boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertCircle size={18} />
                        {showError}
                    </div>
                </motion.div>
            )}
            </main>
        </div>
    );
};

export default AdminPage;
