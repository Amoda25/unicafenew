import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, Clock, CheckCircle, RefreshCcw, AlertCircle, MessageSquare, Timer, Flame, ShoppingBag, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || null;
        } catch (e) {
            return null;
        }
    });
    const [username, setUsername] = useState(user?.username || '');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!username) {
                setOrders([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const response = await axios.get(`/api/orders/${username}`);
                setOrders(response.data);
            } catch (err) {
                console.error("Error fetching history:", err);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [username]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleCancelOrder = async (orderId) => {
        if (window.confirm("Are you sure you want to cancel this order?")) {
            try {
                await axios.delete(`/api/orders/${orderId}`);
                setOrders(orders.filter(o => o._id !== orderId));
            } catch (err) {
                alert(err.response?.data?.error || "Failed to cancel order");
            }
        }
    };

    const mockOrders = [
        {
            _id: 'm1',
            createdAt: new Date(Date.now() - 3600000),
            totalAmount: 400,
            status: 'ready',
            items: [{ name: 'Chicken Kottu', quantity: 1, price: 400 }]
        },
        {
            _id: 'm2',
            createdAt: new Date(Date.now() - 86400000),
            totalAmount: 150,
            status: 'picked-up',
            items: [{ name: 'Kiribath with Lunu Miris', quantity: 1, price: 150 }]
        }
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return { color: '#b45309', bg: '#fef3c7', icon: <Clock size={16} />, label: 'Order Pending' };
            case 'preparing': return { color: '#ea580c', bg: '#ffedd5', icon: <Timer size={16} className="animate-pulse" />, label: 'Preparing' };
            case 'process': return { color: '#f59e0b', bg: '#fff7ed', icon: <RefreshCcw size={16} className="animate-spin" />, label: 'Processing' };
            case 'cookd': return { color: '#ec4899', bg: '#fdf2f8', icon: <Flame size={16} />, label: 'Cooked' };
            case 'ready': return { color: '#10b981', bg: '#d1fae5', icon: <ShoppingBag size={16} className="animate-bounce" />, label: 'Ready for Pickup' };

            case 'picked-up': return { color: '#475569', bg: '#f1f5f9', icon: <Package size={16} />, label: 'Completed' };
            default: return { color: '#b91c1c', bg: '#fee2e2', icon: <AlertCircle size={16} />, label: 'Cancelled' };
        }
    };

    return (
        <div style={{ padding: '2rem 5%', minHeight: '100vh' }}>
            {/* Profile Header */}
            <div className="glass" style={{ 
                padding: '3rem', 
                marginBottom: '3rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '3rem', 
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                {/* Decorative background circle */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'var(--primary)', opacity: 0.1, filter: 'blur(50px)' }} />

                <div style={{ position: 'relative' }}>
                    <div style={{ 
                        background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)', 
                        width: '120px', height: '120px', 
                        borderRadius: '32px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontSize: '3rem',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        transform: 'rotate(-5deg)'
                    }}>
                        <User size={60} color="white" />
                    </div>
                    <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: '#10b981', padding: '6px 15px', borderRadius: '12px', color: 'white', fontSize: '0.75rem', fontWeight: 800, border: '4px solid #fff' }}>
                        {user?.role?.toUpperCase() || 'STUDENT'}
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text-main)', letterSpacing: '-1px' }}>
                                {user?.name || "User Profile"}
                            </h1>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                    <Package size={18} style={{ color: 'var(--primary)' }} />
                                    <span style={{ fontWeight: 600 }}>ID: {user?.username || "N/A"}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                    <MessageSquare size={18} style={{ color: 'var(--secondary)' }} />
                                    <span>{user?.email || "No email provided"}</span>
                                </div>
                            </div>
                            <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 500, fontSize: '1rem' }}>
                                University of Moratuwa • <span style={{ color: 'var(--primary)' }}>Faculty of Engineering</span>
                            </p>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                            <div className="glass" style={{ padding: '15px 25px', textAlign: 'center', minWidth: '120px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{orders.length}</div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Orders</div>
                            </div>
                            <div className="glass" style={{ padding: '15px 25px', textAlign: 'center', minWidth: '120px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{orders.filter(o => o.status === 'picked-up').length}</div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Cleared</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order History */}
            <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', color: 'var(--text-main)' }}>Order <span className="gradient-text">History</span></h2>

            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>Loading your orders...</div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {orders.map(order => {
                        const style = getStatusStyle(order.status);
                        return (
                            <motion.div
                                key={order._id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass"
                                style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                    <div style={{ color: style.color, background: style.bg, padding: '1rem', borderRadius: '12px' }}>
                                        {style.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
                                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                                            {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 800 }}>LKR {order.totalAmount}</span>
                                            <span style={{ color: style.color, background: style.bg, padding: '2px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                                {style.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        onClick={() => navigate(`/feedback?orderId=${order._id}`)}
                                        className="btn-premium" 
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <MessageSquare size={16} /> Give Feedback
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setShowModal(true);
                                        }}
                                        className="glass" 
                                        style={{ padding: '0.5rem 1.5rem', fontSize: '0.875rem', cursor: 'pointer', borderColor: style.color + '40', color: style.color, background: 'var(--bg-card)' }}
                                    >
                                        View Details
                                    </button>
                                    {order.status === 'pending' && (
                                        <button 
                                            onClick={() => handleCancelOrder(order._id)}
                                            title="Cancel Order"
                                            className="glass" 
                                            style={{ padding: '0.55rem', cursor: 'pointer', borderColor: '#fee2e2', color: '#dc2626', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}

                    {orders.length === 0 && (
                        <div className="glass" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>No orders found. Time to grab some food!</p>
                            <button className="btn-premium" style={{ marginTop: '1.5rem' }} onClick={() => window.location.href = '/order'}>
                                Go to Menu
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Order Details Modal */}
            <AnimatePresence>
                {showModal && selectedOrder && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000 }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass"
                            style={{ 
                                position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', 
                                width: '90%', maxWidth: '500px', padding: '2.5rem', zIndex: 1001,
                                background: 'rgba(255, 255, 255, 0.95)', border: '1px solid var(--primary)',
                                maxHeight: '85vh', overflowY: 'auto',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Order <span className="gradient-text">Details</span></h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                    <AlertCircle size={24} />
                                </button>
                            </div>

                            <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-page)', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>ORDER STATUS</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ padding: '10px', borderRadius: '10px', background: getStatusStyle(selectedOrder.status).bg, color: getStatusStyle(selectedOrder.status).color }}>
                                        {getStatusStyle(selectedOrder.status).icon}
                                    </div>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: getStatusStyle(selectedOrder.status).color, textTransform: 'uppercase' }}>
                                        {getStatusStyle(selectedOrder.status).label}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '1rem' }}>ITEMS ORDERED</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                                                    {item.quantity}
                                                </div>
                                                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</span>
                                            </div>
                                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>LKR {item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total Amount</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>LKR {selectedOrder.totalAmount}</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                                    Ordered on {new Date(selectedOrder.createdAt).toLocaleDateString()} at {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                                </div>
                            </div>

                            <button 
                                onClick={() => setShowModal(false)}
                                className="btn-premium" 
                                style={{ width: '100%', padding: '1rem', marginTop: '2rem' }}
                            >
                                Close Details
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfilePage;
