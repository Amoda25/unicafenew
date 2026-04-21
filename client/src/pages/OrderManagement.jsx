import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, Clock, Utensils, ClipboardList,
    Plus, X, AlignLeft, Search, Bell, MessageSquare, Edit2, Trash2, Calendar,
    Activity, TrendingUp, CheckCircle, Smartphone, BarChart, Users, Zap
} from 'lucide-react';
import axios from 'axios';
import OrderSidebar from '../components/OrderSidebar';
import CalendarView from './CalendarView';

const OrderManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['dashboard', 'orders', 'menu', 'calendar'].includes(tab)) {
            setActiveTab(tab);
        } else {
            setActiveTab('dashboard'); // Default to overview
        }
    }, [location.search]);
    const [users, setUsers] = useState([]);
    const [globalSearch, setGlobalSearch] = useState('');
    const [showSuccess, setShowSuccess] = useState('');
    const [analytics, setAnalytics] = useState(null);

    const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'];
    const statuses = ['pending', 'preparing', 'ready', 'picked-up'];





    useEffect(() => {
        fetchOrders();
        fetchUsers();
        fetchAnalytics();

        const intervalId = setInterval(() => {
            fetchOrders();
            fetchAnalytics();
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get('/api/admin/stats');
            setAnalytics(response.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
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

    // Menu Management functions removed (now in MenuManagement.jsx)

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
            setShowSuccess('Order status updated!');
            fetchOrders();
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
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            alert('Failed to delete order');
        }
    };

    const renderDashboardOverview = () => {
        const pendingCount = orders.filter(o => o.status === 'pending').length;
        const activeCount = orders.filter(o => ['preparing', 'process', 'cookd'].includes(o.status)).length;
        const readyCount = orders.filter(o => o.status === 'ready').length;

        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const totalOrdersToday = orders.length;

        const statCards = [
            { title: 'Pending Orders', val: pendingCount, sub: 'Waiting to start', icon: Clock, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' },
            { title: 'Kitchen Active', val: activeCount, sub: 'Preparing/Cooking', icon: Activity, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
            { title: 'Ready to Pickup', val: readyCount, sub: 'Waiting for student', icon: CheckCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
            { title: 'Confirmed Payments', val: orders.filter(o => o.status === 'Paid').length, sub: 'Confirmed via QR scan', icon: Smartphone, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
            { title: 'Total Volume', val: totalOrdersToday, sub: 'Today\'s orders', icon: Zap, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' }

        ];

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Dashboard Overview</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.875rem', fontWeight: 700 }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }}></div>
                            Live Queue Performance Insights
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                    {statCards.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass"
                            style={{ padding: '24px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>{stat.title}</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b' }}>{stat.val}</div>
                                </div>
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <stat.icon size={24} />
                                </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{stat.sub}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Analytics Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Top Selling Items (Menu Analytics) */}
                    <div className="glass" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Utensils size={20} color="#f59e0b" /> Top Selling Menu Items
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {analytics?.analytics?.popularItems?.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '30px', fontWeight: 800, color: '#94a3b8' }}>#{idx + 1}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item._id}</span>
                                            <span style={{ fontWeight: 800, color: '#10b981', fontSize: '0.85rem' }}>{item.count} sold</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(item.count / (analytics?.analytics?.popularItems?.[0]?.count || 1)) * 100}%` }}
                                                style={{ height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', borderRadius: '4px' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )) || <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Loading analytics...</div>}
                        </div>
                    </div>

                    {/* Queue Efficiency & Trends */}
                    <div className="glass" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Activity size={20} color="#6366f1" /> Queue Efficiency Trends
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div style={{ padding: '15px', background: 'var(--latte-card)', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '5px' }}>AVG. Wait Time</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#6366f1' }}>{analytics?.analytics?.avgOrderValue ? '12 min' : '10 min'}</div>
                                </div>
                                <div style={{ padding: '15px', background: 'var(--latte-card)', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '5px' }}>Peak Service Hour</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ec4899' }}>12:00 PM</div>
                                </div>
                            </div>
                            
                            {/* Weekly Trend Visual */}
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>Weekly Order Volume</div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px', paddingBottom: '5px' }}>
                                    {analytics?.analytics?.weeklyTrends?.slice(-7).map((day, idx) => (
                                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                            <motion.div 
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(day.count / (Math.max(...analytics.analytics.weeklyTrends.map(d => d.count)) || 1)) * 100}%` }}
                                                style={{ width: '100%', background: '#6366f1', borderRadius: '3px', opacity: 0.7 }}
                                            />
                                            <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>{day._id.split('-').slice(1).join('/')}</span>
                                        </div>
                                    )) || Array(7).fill(0).map((_, i) => <div key={i} style={{ flex: 1, height: '20%', background: '#f1f5f9', borderRadius: '3px' }} />)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    {/* Recent Order Flow */}
                    <div className="glass" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={20} color="#6366f1" /> Recent Order Flow
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {orders.slice(0, 5).map((order) => (
                                <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--latte-card)', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ fontWeight: 800, color: '#6366f1' }}>#{order.queuePosition}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{order.username}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                {order.items?.length || 0} items • LKR {order.totalAmount}
                                            </div>
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        padding: '4px 10px',
                                        borderRadius: '99px',
                                        background: order.status === 'ready' ? '#dcfce7' : 
                                                   ['preparing', 'process', 'cookd'].includes(order.status) ? '#fef3c7' : '#fee2e2',
                                        color: order.status === 'ready' ? '#10b981' : 
                                               ['preparing', 'process', 'cookd'].includes(order.status) ? '#f59e0b' : '#ef4444'
                                    }}>
                                        {order.status.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Shortcuts */}
                    <div className="glass" style={{ padding: '24px', background: 'linear-gradient(135deg, var(--coffee-dark) 0%, #3b1f0e 100%)', color: 'white', border: '1px solid rgba(201, 147, 90, 0.3)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', color: 'var(--latte-bg)' }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button 
                                onClick={() => setActiveTab('orders')} 
                                style={{ padding: '15px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.08)', color: 'white', fontWeight: 700, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '10px' }} 
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} 
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            >
                                <Users size={16} color="var(--latte-highlight)" /> View Active Queue
                            </button>
                            <button 
                                onClick={() => setActiveTab('calendar')} 
                                style={{ padding: '15px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.08)', color: 'white', fontWeight: 700, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '10px' }} 
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} 
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            >
                                <Calendar size={16} color="var(--latte-highlight)" /> Special Events Calendar
                            </button>
                            <button 
                                onClick={() => navigate('/menu-admin')} 
                                style={{ padding: '15px', borderRadius: '12px', border: 'none', background: 'rgba(201, 147, 90, 0.2)', color: 'var(--latte-highlight)', fontWeight: 800, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '10px' }} 
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(201, 147, 90, 0.3)'} 
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(201, 147, 90, 0.2)'}
                            >
                                <Utensils size={16} /> Update Menu Items
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderOrderManager = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Order Queue <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>({orders.length} active)</span></h3>
                    <button 
                        onClick={() => setActiveTab('calendar')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: '#6366f1',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Calendar size={14} /> Open Special Events Calendar
                    </button>
                    <button 
                        onClick={() => navigate('/menu-admin')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            background: 'rgba(255, 184, 0, 0.1)',
                            color: '#FFB800',
                            border: '1px solid rgba(255, 184, 0, 0.2)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Utensils size={14} /> Manage Menu Items
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {statuses.map(status => (
                        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: status === 'Paid' ? '#10b981' :
                                    status === 'ready' ? '#10b981' :

                                        status === 'preparing' ? '#f59e0b' :
                                            status === 'pending' ? '#fbbf24' : '#64748b'



                            }} />
                            {status === 'ready' ? 'READY' : status.toUpperCase()}


                        </div>
                    ))}
                </div>
            </div>

            <div style={{ padding: '32px', borderRadius: '24px', background: 'var(--latte-card)', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                    <thead>
                        <tr style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>
                            <th style={{ padding: '0 16px', textAlign: 'left' }}>Que #</th>
                            <th style={{ padding: '0 16px', textAlign: 'left' }}>Student Details</th>
                            <th style={{ padding: '0 16px', textAlign: 'left' }}>Order Content</th>
                            <th style={{ padding: '0 16px', textAlign: 'left' }}>Payment</th>
                            <th style={{ padding: '0 16px', textAlign: 'left' }}>Current Status</th>

                            <th style={{ padding: '0 16px', textAlign: 'right' }}>Update</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.filter(order => (order._id?.toLowerCase() || '').includes(globalSearch.toLowerCase()) || (order.username?.toLowerCase() || '').includes(globalSearch.toLowerCase())).map(order => {
                            const timeDiff = Math.floor((new Date() - new Date(order.createdAt)) / 60000);
                            return (
                                <tr key={order._id} style={{ background: '#f8fafc', borderBottom: '4px solid var(--latte-bg)' }}>
                                    <td style={{ padding: '20px 16px', borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>#{order.queuePosition}</div>
                                    </td>
                                    <td style={{ padding: '20px 16px' }}>
                                        <div style={{ fontWeight: 700 }}>{order.username}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} /> {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            <span style={{ color: timeDiff > 15 ? '#ef4444' : '#64748b', fontWeight: 700 }}>
                                                ({timeDiff >= 1440 ? `${Math.floor(timeDiff / 1440)}d ${Math.floor((timeDiff % 1440) / 60)}h` : timeDiff >= 60 ? `${Math.floor(timeDiff / 60)}h ${timeDiff % 60}m` : `${timeDiff}m`} ago)
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 16px' }}>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {order.items?.map((item, i) => (
                                                <span key={i} style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px', background: '#e2e8f0', color: '#1e293b', fontWeight: 600 }}>
                                                    {item.quantity}x {item.name?.en || item.name}
                                                </span>
                                            ))}
                                        </div>
                                        <div style={{ fontWeight: 800, marginTop: '8px', fontSize: '0.875rem' }}>LKR {order.totalAmount}</div>
                                    </td>
                                    <td style={{ padding: '20px 16px' }}>
                                        <span style={{ 
                                            fontSize: '0.75rem', 
                                            padding: '6px 12px', 
                                            borderRadius: '8px', 
                                            background: order.status === 'Paid' ? '#DCFCE7' : '#FEE2E2',
                                            color: order.status === 'Paid' ? '#15803D' : '#B91C1C',
                                            fontWeight: 900,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            {order.status === 'Paid' ? <CheckCircle size={14} /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#B91C1C' }} />}
                                            {order.status === 'Paid' ? 'PAID' : 'NOT PAID'}
                                        </span>


                                    </td>
                                    <td style={{ padding: '20px 16px' }}>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: order.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' :
                                                order.status === 'ready' ? 'rgba(16, 185, 129, 0.1)' :

                                                    ['preparing', 'process', 'cookd'].includes(order.status) ? 'rgba(245, 158, 11, 0.1)' :
                                                        order.status === 'pending' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                                            color: order.status === 'Paid' ? '#10b981' :
                                                order.status === 'ready' ? '#10b981' :

                                                    ['preparing', 'process', 'cookd'].includes(order.status) ? '#f59e0b' :
                                                        order.status === 'pending' ? '#fbbf24' : '#64748b',

                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <Zap size={12} />
                                            {order.status === 'ready' ? 'READY' : order.status.toUpperCase()}


                                        </span>
                                    </td>
                                    <td style={{ padding: '20px 16px', textAlign: 'right', borderTopRightRadius: '16px', borderBottomRightRadius: '16px' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            {order.status === 'pending' && (
                                                <button 
                                                    onClick={() => handleUpdateOrderStatus(order._id, 'preparing')}
                                                    style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                                >
                                                    Accept
                                                </button>
                                            )}
                                            {order.status === 'preparing' && (
                                                <button 
                                                    onClick={() => handleUpdateOrderStatus(order._id, 'ready')}

                                                    style={{ padding: '8px 12px', borderRadius: '8px', background: '#10b981', color: 'white', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                                >
                                                    Ready for Pickup
                                                </button>
                                            )}
                                            {order.status === 'ready' && (

                                                <button 
                                                    onClick={() => handleUpdateOrderStatus(order._id, 'picked-up')}
                                                    style={{ padding: '8px 12px', borderRadius: '8px', background: '#6366f1', color: 'white', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                                >
                                                    Finalize
                                                </button>
                                            )}

                                            <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 4px' }} />

                                            <select
                                                value={order.status}
                                                onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    background: '#f8fafc',
                                                    border: '1px solid #cbd5e1',
                                                    color: '#1f2937',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    outline: 'none'
                                                }}
                                            >
                                                {statuses.filter(s => s !== 'Paid' && s !== 'picked-up').map(s => (
                                                    <option key={s} value={s}>{s === 'ready' ? 'READY' : s.toUpperCase()}</option>
                                                ))}


                                            </select>

                                            <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 4px' }} />

                                            <button
                                                onClick={() => handleDeleteOrder(order._id)}
                                                style={{ padding: '8px', borderRadius: '8px', background: 'transparent', color: '#ef4444', border: '1px solid #fca5a5', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                            >
                                                <Trash2 size={16} />
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
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)', color: '#111827' }}>
            <OrderSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', padding: '20px' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{ height: '100%' }}
                        >
                            {activeTab === 'dashboard' && renderDashboardOverview()}
                            {activeTab === 'orders' && renderOrderManager()}
                            {activeTab === 'calendar' && (
                                <div style={{ padding: '0 20px' }}>
                                    <CalendarView isEmbedded={true} />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>



            {showSuccess && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ position: 'fixed', bottom: '40px', right: '40px', background: '#10b981', padding: '16px 25px', borderRadius: '16px', color: 'white', fontWeight: 700, zIndex: 3000, boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)' }}
                >
                    {showSuccess}
                </motion.div>
            )}
        </div>
    );
};

export default OrderManagement;
