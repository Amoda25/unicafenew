import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Clock, Trash2, ArrowLeft, BellOff, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/notifications/${user.username}`);
            setNotifications(response.data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await axios.put(`/api/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.put(`/api/notifications/mark-all-read/${user.username}`);
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        
        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--coffee-light)', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button 
                            onClick={() => navigate(-1)}
                            style={{ background: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', color: 'var(--coffee-dark)' }}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--coffee-dark)', margin: 0 }}>Notifications</h1>
                    </div>
                    {notifications.some(n => !n.isRead) && (
                        <button 
                            onClick={handleMarkAllAsRead}
                            style={{ padding: '0.6rem 1.2rem', background: 'white', border: '1px solid var(--latte-border)', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--coffee-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                        >
                            <Check size={16} /> Mark all as read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden', padding: '1rem' }}>
                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--coffee-muted)' }}>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'inline-block', marginBottom: '1rem' }}>
                                <Bell size={32} />
                            </motion.div>
                            <p style={{ fontWeight: 600 }}>Caffeinating your notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--coffee-muted)' }}>
                            <BellOff size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--coffee-dark)' }}>No notifications yet</h3>
                            <p>We'll notify you when your orders are ready!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <AnimatePresence>
                                {notifications.map((notification, index) => (
                                    <motion.div
                                        key={notification._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        style={{ 
                                            padding: '1.25rem',
                                            borderRadius: '16px',
                                            background: notification.isRead ? 'transparent' : 'rgba(255, 255, 255, 0.6)',
                                            border: notification.isRead ? '1px solid transparent' : '1px solid var(--latte-border)',
                                            display: 'flex',
                                            gap: '1rem',
                                            position: 'relative',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ 
                                            width: '48px', 
                                            height: '48px', 
                                            borderRadius: '12px', 
                                            background: notification.isRead ? '#f1f5f9' : 'var(--coffee-dark)', 
                                            color: notification.isRead ? '#94a3b8' : 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {notification.type === 'order' ? <CheckCircle size={24} /> : <Bell size={24} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <p style={{ fontWeight: notification.isRead ? 500 : 700, color: 'var(--coffee-dark)', margin: '0 0 0.25rem 0', fontSize: '0.95rem', lineHeight: 1.4 }}>
                                                    {notification.message}
                                                </p>
                                                {!notification.isRead && (
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--latte-highlight)', flexShrink: 0, marginTop: '5px' }} />
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
                                                <Clock size={12} />
                                                {formatDate(notification.createdAt)}
                                            </div>
                                        </div>
                                        {notification.isRead ? null : (
                                            <button 
                                                onClick={() => handleMarkAsRead(notification._id)}
                                                className="btn-mark-read"
                                                style={{ position: 'absolute', right: '10px', bottom: '10px', background: 'none', border: 'none', fontSize: '0.7rem', fontWeight: 700, color: 'var(--latte-highlight)', cursor: 'pointer', padding: '4px 8px' }}
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
