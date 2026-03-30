import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, TrendingUp, Clock, Package, Zap, BarChart3, Users as UsersIcon,
    Plus, X, AlignLeft, Search, Bell, MessageSquare, Trash2, FileText, Download,
    Target, ArrowUpRight, Award, Flame
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import axios from 'axios';
import SalesSidebar from '../components/SalesSidebar';

const SalesManagement = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [salesGoal, setSalesGoal] = useState(50000); // Default Target
    const [goalInput, setGoalInput] = useState('50000');
    const [goalError, setGoalError] = useState('');
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [globalSearch, setGlobalSearch] = useState('');
    const [showDailyReport, setShowDailyReport] = useState(false);
    const [selectedReportDate, setSelectedReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState('');
    const [showError, setShowError] = useState('');
    
    const [userFormData, setUserFormData] = useState({
        name: '',
        studentId: '',
        password: '',
        role: 'student'
    });
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

    useEffect(() => {
        fetchOrders();
        fetchUsers();

        const intervalId = setInterval(() => {
            fetchOrders();
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

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

    const resetForm = () => {
        setUserFormData({
            name: '',
            studentId: '',
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

    const handleAddUser = async (e) => {
        e.preventDefault();

        // Password Validation
        const isPasswordValid = Object.values(passwordRequirements).every(req => req);
        if (!isPasswordValid) {
            setShowError('Invalid password! Please follow all requirements.');
            setTimeout(() => setShowError(''), 4000);
            return;
        }

        try {
            await axios.post('/api/users/register', userFormData);
            setShowSuccess('User registered successfully!');
            setShowUserModal(false);
            resetForm();
            fetchUsers();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            alert(err.response?.data?.error || 'Registration failed');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`/api/users/${userId}/role`, { role: newRole });
            setShowSuccess('User role updated!');
            fetchUsers();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            alert('Failed to update role');
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

    const handleUpdateGoal = (e) => {
        e.preventDefault();
        const num = parseFloat(goalInput);
        if (isNaN(num) || num <= 0) {
            setGoalError('Please enter a valid target amount (e.g., 50000)');
            return;
        }
        setSalesGoal(num);
        setGoalError('');
        setShowSuccess('Sales target updated!');
        setTimeout(() => setShowSuccess(''), 3000);
    };

    const renderDashboardOverview = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayOrders = orders.filter(o => new Date(o.createdAt).toISOString().split('T')[0] === todayStr);
        const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const progressPercent = Math.min(Math.round((todayRevenue / salesGoal) * 100), 100);
        const remainingToGoal = Math.max(salesGoal - todayRevenue, 0);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '30px' }}>
                    {/* Goal Performance Card */}
                    <div className="glass" style={{
                        padding: '40px',
                        background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '5px' }}>Daily Sales Performance</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Tracking your LKR {salesGoal.toLocaleString()} target</p>
                                </div>
                                <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(255,184,0,0.2)', color: '#FFB800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Award size={32} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '30px' }}>
                                <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                                    <svg width="150" height="150" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#FFB800" strokeWidth="10" 
                                            strokeDasharray={`${progressPercent * 2.82} 282`} 
                                            transform="rotate(-90 50 50)" 
                                            strokeLinecap="round"
                                            style={{ transition: 'stroke-dasharray 1s ease-out' }} 
                                        />
                                        <text x="50" y="55" textAnchor="middle" fill="white" fontSize="18" fontWeight="800">{progressPercent}%</text>
                                    </svg>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '5px' }}>Current Revenue</div>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>LKR {todayRevenue.toLocaleString()}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Orders</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{todayOrders.length}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Gap to Goal</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: remainingToGoal === 0 ? '#10b981' : '#f87171' }}>
                                                {remainingToGoal === 0 ? 'Goal Met!' : `LKR ${remainingToGoal.toLocaleString()}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Background Decor */}
                        <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', color: 'rgba(255,184,0,0.05)' }}>
                            <TrendingUp size={200} />
                        </div>
                    </div>

                    {/* Goal Settings Form */}
                    <div className="glass" style={{ padding: '30px', background: 'white', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Target size={20} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Goal Settings</h3>
                        </div>

                        <form onSubmit={handleUpdateGoal} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>DAILY REVENUE TARGET (LKR)</label>
                                <input 
                                    type="text"
                                    value={goalInput}
                                    onChange={(e) => setGoalInput(e.target.value)}
                                    placeholder="Enter target amount..."
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        border: goalError ? '2px solid #ef4444' : '1px solid #e2e8f0',
                                        fontSize: '1.1rem',
                                        fontWeight: 800,
                                        outline: 'none',
                                        background: '#f8fafc'
                                    }}
                                />
                                {goalError && <p style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, marginTop: '8px' }}>{goalError}</p>}
                            </div>
                            
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                Set a realistic goal for your canteen to help the AI better analyze peak hour spikes and inventory needs.
                            </p>

                            <button type="submit" className="btn-premium" style={{ marginTop: 'auto', width: '100%', padding: '16px' }}>
                                Save Target Parameters
                            </button>
                        </form>
                    </div>
                </div>

                {/* Dashboard Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                    <div className="glass" style={{ padding: '25px', background: 'white', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowUpRight size={24} />
                        </div>
                        <div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>PEAK HOUR TODAY</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>12:30 PM</div>
                        </div>
                    </div>
                    <div className="glass" style={{ padding: '25px', background: 'white', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Flame size={24} />
                        </div>
                        <div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>HOT SELLER</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                                {analytics.popularItems[0]?.name || 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="glass" style={{ padding: '25px', background: 'white', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={24} />
                        </div>
                        <div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>AI PREDICTION</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>Stable Growth</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- ANALYTICS PROCESSING DATA ---
    const getAnalyticsData = () => {
        // 1. Weekly Area Chart Data (Last 7 Days)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
                name: days[d.getDay()],
                dateStr: d.toISOString().split('T')[0],
                revenue: 0,
                orderCount: 0
            };
        });

        orders.forEach(order => {
            const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
            const dayBucket = last7Days.find(d => d.dateStr === orderDate);
            if (dayBucket) {
                dayBucket.revenue += order.totalAmount || 0;
                dayBucket.orderCount += 1;
            }
        });

        // 2. Category Pie Chart Data
        const categories = { 'Meals': 0, 'Drinks': 0, 'Snacks': 0 };
        orders.forEach(order => {
            order.items?.forEach(item => {
                const category = item.category || 'Meals';
                if (categories.hasOwnProperty(category)) {
                    categories[category] += item.quantity || 1;
                } else {
                    categories['Meals'] += item.quantity || 1;
                }
            });
        });

        const totalItemsOrdered = Object.values(categories).reduce((a, b) => a + b, 0) || 1;
        const pieData = Object.entries(categories).map(([name, val]) => ({
            name,
            value: Math.round((val / totalItemsOrdered) * 100)
        }));

        // 3. Popular Items (Top 4)
        const itemCounts = {};
        orders.forEach(order => {
            order.items?.forEach(item => {
                const name = item.name?.en || item.name;
                itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1);
            });
        });

        const totalUnits = Object.values(itemCounts).reduce((a, b) => a + b, 0) || 1;
        const popularItems = Object.entries(itemCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name, count]) => ({
                name,
                percent: Math.round((count / totalUnits) * 100),
                color: name.toLowerCase().includes('burger') ? '#ff9f43' : 
                       name.toLowerCase().includes('latte') ? '#a855f7' : '#06b6d4'
            }));

        return { last7Days, pieData, popularItems };
    };

    const analytics = getAnalyticsData();

    const renderAnalytics = () => {
        const topCustomers = Object.values(orders.reduce((acc, order) => {
            const studentId = order.studentId;
            if (!acc[studentId]) {
                const user = users.find(u => u.studentId === studentId || u._id === studentId);
                acc[studentId] = {
                    name: user?.name || 'Customer',
                    role: user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Student',
                    totalSpend: 0
                };
            }
            acc[studentId].totalSpend += order.totalAmount || 0;
            return acc;
        }, {}))
        .sort((a, b) => b.totalSpend - a.totalSpend)
        .slice(0, 4);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {/* AI Assistant Insight Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px', marginBottom: '30px' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass"
                        style={{
                            padding: '40px',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
                            borderRadius: '32px',
                            border: '1px solid rgba(139, 92, 246, 0.15)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '30px',
                            boxShadow: '0 20px 50px rgba(139, 92, 246, 0.08)',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ 
                                    width: '64px', height: '64px', 
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                    borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)'
                                }}>
                                    <BarChart3 size={32} color="white" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#1e293b' }}>UniCafé Sales AI</h3>
                                    <p style={{ margin: '5px 0 0', color: '#64748b', fontWeight: 500 }}>Intelligent revenue insights</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="date" 
                                        value={selectedReportDate}
                                        onChange={(e) => {
                                            setSelectedReportDate(e.target.value);
                                            setShowDailyReport(true);
                                        }}
                                        style={{
                                            padding: '8px 15px',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(139, 92, 246, 0.2)',
                                            background: 'white',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            color: '#1e293b',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                                        }}
                                    />
                                </div>
                                <span style={{ padding: '8px 20px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                                    AI Tracking On
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px', alignItems: 'center' }}>
                            {/* AI Insights (Left side) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>Daily Smart Highlights</h4>
                                
                                <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>Spike Alert: Iced Beverages</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Ordering volume for drinks is up 32% compared to last Friday.</div>
                                    </div>
                                </div>

                                <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>Peak Hour Prediction</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Expect a 25% increase in traffic between 1:00 PM - 2:30 PM.</div>
                                    </div>
                                </div>

                                <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>Inventory Check-in</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>"Chicken Breast" stock is low. Consider ordering for next week.</div>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Interface (Right side) */}
                            <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '28px', border: '1px solid #e2e8f0', padding: '30px', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ flex: 1, maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ alignSelf: 'flex-start', background: '#f8fafc', padding: '12px 18px', borderRadius: '18px 18px 18px 0', fontSize: '0.9rem', border: '1px solid #f1f5f9', boxSizing: 'border-box' }}>
                                        Hello Sales Admin! I've analyzed today's data. Everything looks stable, but I recommend a small promotion for "Snacks" to boost afternoon sales.
                                    </div>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Zap size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Ask AI for revenue forecast..." 
                                        style={{
                                            width: '100%',
                                            padding: '16px 60px 16px 50px',
                                            borderRadius: '20px',
                                            border: '1px solid #cbd5e1',
                                            background: 'white',
                                            fontSize: '0.95rem',
                                            fontWeight: 500,
                                            outline: 'none',
                                            transition: 'all 0.3s',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                                        }}
                                    />
                                    <div style={{ 
                                        position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', 
                                        width: '44px', height: '44px', borderRadius: '16px', 
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                    }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '30px' }}>
                    <div className="glass" style={{ padding: '30px', background: 'white', borderRadius: '24px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Revenue & Orders</h4>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ padding: '6px 16px', borderRadius: '99px', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Revenue</span>
                                <span style={{ padding: '6px 16px', borderRadius: '99px', border: '1px solid #06b6d4', fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4' }}>Orders</span>
                            </div>
                        </div>
                        <div style={{ flex: 1, minHeight: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.last7Days}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff9f43" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#ff9f43" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorOrd" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#ff9f43" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                    <Area type="monotone" dataKey="orderCount" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorOrd)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '30px', background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Sales by Category</h4>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', fontSize: '1rem', fontWeight: 800, color: '#1f2937' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}><span>60%</span><span style={{color:'#94a3b8', fontWeight:600, fontSize: '0.75rem'}}>Meals</span></div>
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}><span>35%</span><span style={{color:'#94a3b8', fontWeight:600, fontSize: '0.75rem'}}>Drinks</span></div>
                        </div>
                        <div style={{ flex: 1, minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={analytics.pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={6}>
                                        <Cell fill="#ff9f43" />
                                        <Cell fill="#06b6d4" />
                                        <Cell fill="#e2e8f0" />
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginTop: '10px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{width:10, height:10, borderRadius:'50%', background:'#ff9f43'}}/> Meals 60%</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{width:10, height:10, borderRadius:'50%', background:'#06b6d4'}}/> Drinks 35%</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{width:10, height:10, borderRadius:'50%', background:'#e2e8f0'}}/> Snacks 5%</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px' }}>
                    <div className="glass" style={{ padding: '30px', background: 'white', borderRadius: '24px', border: '1px solid #f0f0f0' }}>
                        <h4 style={{ margin: '0 0 30px', fontSize: '1.2rem', fontWeight: 800 }}>Popular Items</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            {analytics.popularItems.length === 0 ? (
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center' }}>No sales data for items yet.</p>
                            ) : analytics.popularItems.map((item, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>
                                        <span>{item.name}</span>
                                        <span style={{ color: '#94a3b8' }}>{item.percent}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                                        <div style={{ width: `${item.percent}%`, height: '100%', background: item.color, borderRadius: '99px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '30px', background: 'white', borderRadius: '24px', border: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Recent Top Customers</h4>
                            <button style={{ background: 'none', border: 'none', color: '#ff9f43', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>View All</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {topCustomers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontWeight: 600 }}>No order data available</div>
                            ) : topCustomers.map((user, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderRadius: '16px', border: '1px solid #f8fafc', background: '#fafafa', transition: 'all 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={(e) => e.currentTarget.style.background = '#fafafa'}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#e2e8f0' }} />
                                        <div>
                                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{user.name}</div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>{user.role}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>LKR {user.totalSpend.toLocaleString()}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ff9f43' }}>Total Value</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
                            {users.filter(user => (user.name?.toLowerCase() || '').includes(globalSearch.toLowerCase()) || (user.studentId?.toLowerCase() || '').includes(globalSearch.toLowerCase()) || (user.role?.toLowerCase() || '').includes(globalSearch.toLowerCase())).map((user) => (
                                <tr key={user._id} style={{ background: '#f8fafc', borderRadius: '12px' }}>
                                    <td style={{ padding: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{user.studentId}</td>
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
                                            }}
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
                                        <button onClick={() => handleDeleteUser(user._id)} className="glass" style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', marginLeft: 'auto' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', color: '#111827' }}>
            <SalesSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', padding: '20px' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'dashboard' && renderDashboardOverview()}
                            {activeTab === 'analytics' && renderAnalytics()}
                            {activeTab === 'users' && renderUserManager()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

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
                            style={{ width: '100%', maxWidth: '800px', background: 'white', borderRadius: '32px', position: 'relative', zIndex: 1, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                        >
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

                            <div style={{ padding: '40px' }}>
                                {(() => {
                                    const dayOrders = orders.filter(o => new Date(o.createdAt).toISOString().split('T')[0] === selectedReportDate);
                                    const dayRevenue = dayOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
                                    const avgOrderVal = dayOrders.length > 0 ? Math.round(dayRevenue / dayOrders.length) : 0;
                                    
                                    const dayItemCounts = {};
                                    dayOrders.forEach(o => o.items?.forEach(i => {
                                        const name = i.name?.en || i.name;
                                        dayItemCounts[name] = (dayItemCounts[name] || 0) + (i.quantity || 1);
                                    }));
                                    const dayTopItems = Object.entries(dayItemCounts)
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 3)
                                        .map(([name, sales]) => ({ name, sales, revenue: orders.find(o => o.items.some(k => (k.name?.en || k.name) === name))?.items.find(k => (k.name?.en || k.name) === name)?.price * sales || 0 }));

                                    return (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                                                <div style={{ padding: '25px', borderRadius: '24px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Total Revenue</div>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>LKR {dayRevenue.toLocaleString()}</div>
                                                </div>
                                                <div style={{ padding: '25px', borderRadius: '24px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Total Orders</div>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{dayOrders.length}</div>
                                                </div>
                                                <div style={{ padding: '25px', borderRadius: '24px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Avg. Order</div>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>LKR {avgOrderVal.toLocaleString()}</div>
                                                </div>
                                            </div>

                                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px' }}>Top Selling Items Today</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                {dayTopItems.length === 0 ? (
                                                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '10px' }}>No sales recorded for this date.</p>
                                                ) : dayTopItems.map((item, i) => (
                                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 25px', borderRadius: '18px', background: '#ffffff', border: '1px solid #f1f5f9' }}>
                                                        <span style={{ fontWeight: 700, color: '#1e293b' }}>{item.name}</span>
                                                        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                                                            <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>{item.sales} sold</span>
                                                            <span style={{ fontWeight: 800, color: '#10b981' }}>LKR {item.revenue.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    );
                                })()}

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

            <AnimatePresence>
                {showUserModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowUserModal(false); resetForm(); }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1001 }} />
                        <div style={{ position: 'fixed', top: 0, left: '280px', right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002, pointerEvents: 'none', padding: '20px' }}>
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} style={{ pointerEvents: 'auto', width: '100%', maxWidth: '500px', background: 'white', borderRadius: '24px', padding: '2.5rem', zIndex: 1002, border: '1px solid #f1f5f9', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}>
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
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Student/Staff ID</label>
                                        <input required value={userFormData.studentId} onChange={(e) => setUserFormData({ ...userFormData, studentId: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'white', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }} placeholder="e.g. IT2100000" />
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

            {showSuccess && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ position: 'fixed', bottom: '40px', right: '40px', background: '#10b981', padding: '16px 25px', borderRadius: '16px', color: 'white', fontWeight: 700, zIndex: 3000, boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)' }}
                >
                    {showSuccess}
                </motion.div>
            )}

            {showError && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ position: 'fixed', bottom: '40px', right: '40px', background: '#ef4444', padding: '16px 25px', borderRadius: '16px', color: 'white', fontWeight: 700, zIndex: 3000, boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)' }}
                >
                    {showError}
                </motion.div>
            )}
        </div>
    );
};

export default SalesManagement;
