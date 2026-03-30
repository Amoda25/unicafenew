import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, MessageSquare, Trash2, Star, Send, CheckCircle, Clock, AlertCircle, X, Flag, TrendingUp, Users, Inbox } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import FeedbackSidebar from '../components/FeedbackSidebar';

const FeedbackManagement = () => {
    const [activeTab, setActiveTab] = useState('messages');
    const [globalSearch, setGlobalSearch] = useState('');
    const [contactMessages, setContactMessages] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isRatingsRefreshing, setIsRatingsRefreshing] = useState(false);
    const [ratingFilter, setRatingFilter] = useState('all'); 
    const [categoryFilter, setCategoryFilter] = useState('All'); 
    const [adminStatusFilter, setAdminStatusFilter] = useState('all'); // all, pending, responded
    
    // Reply states
    const [replyingId, setReplyingId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replyStatus, setReplyStatus] = useState('Resolved');
    const [valError, setValError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const MAX_REPLY_LENGTH = 300;

    const quickTemplates = [
        "Thank you for your valuable feedback! We will look into this.",
        "We are sorry for the inconvenience caused. This has been resolved.",
        "Your suggestion has been noted and shared with our kitchen team.",
        "We appreciate your positive rating! Hope to serve you again soon."
    ];

    useEffect(() => {
        fetchContactMessages();
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        setIsRatingsRefreshing(true);
        try {
            const response = await axios.get('/api/feedback');
            setFeedbacks(response.data);
        } catch (err) {
            console.error('Error fetching feedbacks:', err);
        } finally {
            setTimeout(() => setIsRatingsRefreshing(false), 500);
        }
    };

    const fetchContactMessages = async () => {
        setIsRefreshing(true);
        try {
            const response = await axios.get('/api/contact');
            setContactMessages(response.data);
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    // Analytics Calculations
    const avgRating = feedbacks.length > 0 ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1) : 0;
    const pendingActions = contactMessages.filter(m => m.status !== 'Resolved').length + feedbacks.filter(fb => fb.status !== 'Resolved').length;
    const totalUsers = new Set([...feedbacks.map(f => f.username || f.studentId), ...contactMessages.map(m => m.email)]).size;

    const sentimentData = [
        { name: 'Positive', value: feedbacks.filter(f => f.sentiment === 'Positive').length, color: '#10b981' },
        { name: 'Neutral', value: feedbacks.filter(f => f.sentiment === 'Neutral').length, color: '#f59e0b' },
        { name: 'Negative', value: feedbacks.filter(f => f.sentiment === 'Negative').length, color: '#ef4444' }
    ].filter(d => d.value > 0);

    const handleReplySubmit = async (type, id) => {
        if (replyText.length < 5) {
            setValError('Reply must be at least 5 characters long.');
            return;
        }

        if (replyText.length > MAX_REPLY_LENGTH) {
            setValError(`Reply is too long! Maximum ${MAX_REPLY_LENGTH} characters allowed.`);
            return;
        }

        setIsSubmitting(true);
        try {
            const endpoint = type === 'contact' ? `/api/contact/${id}/reply` : `/api/feedback/${id}/reply`;
            await axios.put(endpoint, { adminReply: replyText, status: replyStatus });
            
            if (type === 'contact') fetchContactMessages();
            else fetchFeedbacks();
            
            setReplyingId(null);
            setReplyText('');
            setValError('');
        } catch (err) {
            console.error('Error submitting reply:', err);
            alert('Failed to send reply.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePriority = async (type, id, currentPriority) => {
        try {
            const endpoint = type === 'contact' ? `/api/contact/${id}/priority` : `/api/feedback/${id}/priority`;
            await axios.put(endpoint, { isPriority: !currentPriority });
            
            if (type === 'contact') fetchContactMessages();
            else fetchFeedbacks();
        } catch (err) {
            console.error('Error toggling priority:', err);
        }
    };

    const handleDeleteReply = async (type, id) => {
        if (!window.confirm('Are you sure you want to remove this reply?')) return;
        try {
            const endpoint = type === 'contact' ? `/api/contact/${id}/reply` : `/api/feedback/${id}/reply`;
            await axios.put(endpoint, { adminReply: '', status: 'Pending' });
            
            if (type === 'contact') fetchContactMessages();
            else fetchFeedbacks();
        } catch (err) {
            console.error('Error deleting reply:', err);
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

    const handleDeleteFeedback = async (id) => {
        if (!window.confirm('Are you sure you want to delete this rating?')) return;
        try {
            await axios.delete(`/api/feedback/${id}`);
            fetchFeedbacks();
        } catch (err) {
            console.error('Error deleting feedback:', err);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Resolved': return { bg: 'rgba(16,185,129,0.1)', color: '#10b981', icon: <CheckCircle size={14} /> };
            case 'In Review': return { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', icon: <Clock size={14} /> };
            default: return { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', icon: <AlertCircle size={14} /> };
        }
    };

    const renderReplyBox = (type, id) => (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ marginTop: '20px', padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Write Admin Response:</span>
                <button onClick={() => setReplyingId(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <textarea 
                value={replyText} 
                onChange={(e) => {
                    setReplyText(e.target.value);
                    if (e.target.value.length >= 5 && e.target.value.length <= MAX_REPLY_LENGTH) {
                        setValError('');
                    } else if (e.target.value.length > MAX_REPLY_LENGTH) {
                        setValError(`Character limit reached (${MAX_REPLY_LENGTH})`);
                    }
                }} 
                placeholder="Write your professional response here..." 
                style={{ 
                    width: '100%', 
                    minHeight: '120px', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    background: '#ffffff', 
                    border: `2px solid ${valError ? '#ef4444' : '#e2e8f0'}`, 
                    color: '#000000', 
                    outline: 'none', 
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    marginBottom: '8px', 
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                }} 
                onFocus={(e) => e.target.style.border = `2px solid ${valError ? '#ef4444' : 'var(--primary)'}`}
                onBlur={(e) => e.target.style.border = `2px solid ${valError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`}
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: replyText.length > MAX_REPLY_LENGTH ? '#ef4444' : 'var(--text-secondary)', opacity: 0.8 }}>
                    {replyText.length} / {MAX_REPLY_LENGTH} characters
                </span>
            </div>
            
            {valError && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><AlertCircle size={14} /> {valError}</div>}
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                <div style={{ width: '100%', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Quick Replies:</div>
                {quickTemplates.map((t, idx) => (
                    <button key={idx} onClick={() => {setReplyText(t); setValError('');}} style={{ padding: '8px 14px', borderRadius: '99px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.02)'}>
                        {t.slice(0, 35)}...
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Update Status:</span>
                    <div style={{ position: 'relative' }}>
                        <select 
                            value={replyStatus} 
                            onChange={(e) => setReplyStatus(e.target.value)} 
                            style={{ 
                                padding: '10px 40px 10px 16px', 
                                borderRadius: '10px', 
                                background: '#ffffff', 
                                color: '#000000', 
                                border: '2px solid #e2e8f0', 
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                outline: 'none',
                                appearance: 'none',
                                transition: 'all 0.2s',
                                minWidth: '160px'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        >
                            <option value="Pending" style={{ background: '#ffffff', color: '#000000' }}>⏳ Pending</option>
                            <option value="In Review" style={{ background: '#ffffff', color: '#000000' }}>🔎 In Review</option>
                            <option value="Resolved" style={{ background: '#ffffff', color: '#000000' }}>✅ Resolved</option>
                        </select>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
                            <TrendingUp size={14} style={{ transform: 'rotate(90deg)' }} />
                        </div>
                    </div>
                </div>
                <button 
                    disabled={isSubmitting}
                    onClick={() => handleReplySubmit(type, id)}
                    style={{ 
                        padding: '12px 28px', 
                        borderRadius: '12px', 
                        background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)', 
                        color: 'white', 
                        border: 'none', 
                        fontWeight: 800, 
                        cursor: isSubmitting ? 'wait' : 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        boxShadow: '0 4px 12px rgba(110, 89, 255, 0.2)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    {isSubmitting ? 'Sending...' : <><Send size={18} /> Send Response</>}
                </button>
            </div>
        </motion.div>
    );

    const renderStatsOverview = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) 1.5fr', gap: '20px', marginBottom: '40px' }}>
            <div className="glass" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(110, 89, 255, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Star size={20} /></div>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}><TrendingUp size={12}/> Live</span>
                </div>
                <div><div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{avgRating}</div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Avg Satisfaction</div></div>
            </div>
            <div className="glass" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertCircle size={20} /></div>
                <div><div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{pendingActions}</div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pending Actions</div></div>
            </div>
            <div className="glass" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Inbox size={20} /></div>
                <div><div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{feedbacks.length + contactMessages.length}</div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Entries</div></div>
            </div>
            <div className="glass" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} /></div>
                <div><div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{totalUsers}</div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Unique Users</div></div>
            </div>
            <div className="glass" style={{ padding: '20px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>Sentiment Breakdown</div>
                <div style={{ height: '100px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={30} outerRadius={45} paddingAngle={5} dataKey="value">
                                {sentimentData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', fontSize: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '5px' }}>
                    {sentimentData.map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.65rem', fontWeight: 700, color: s.color }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color }}></div> {s.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderMessagesManager = () => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Contact Messages <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>({contactMessages.length} total)</span></h3>
                    <button disabled={isRefreshing} onClick={fetchContactMessages} className="glass" style={{ padding: '10px 20px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Refresh</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                        {['all', 'pending', 'responded'].map(f => (
                            <button key={f} onClick={() => setAdminStatusFilter(f)} style={{ padding: '8px 20px', borderRadius: '10px', border: 'none', background: adminStatusFilter === f ? 'var(--primary)' : '#ffffff', color: '#000000', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{f}</button>
                        ))}
                    </div>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input type="text" placeholder="Search by name or email..." value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} style={{ width: '100%', padding: '10px 16px 10px 36px', borderRadius: '12px', background: 'var(--bg-card)', color: 'white', border: '1px solid var(--glass-border)', fontSize: '0.85rem' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {contactMessages
                        .filter(msg => (msg.name?.toLowerCase() || '').includes(globalSearch.toLowerCase()) || (msg.email?.toLowerCase() || '').includes(globalSearch.toLowerCase()))
                        .filter(msg => {
                            if (adminStatusFilter === 'pending') return !msg.adminReply;
                            if (adminStatusFilter === 'responded') return !!msg.adminReply;
                            return true;
                        })
                        .sort((a, b) => {
                            if (a.isPriority !== b.isPriority) return b.isPriority ? 1 : -1;
                            return new Date(b.createdAt) - new Date(a.createdAt);
                        })
                        .map(msg => {
                            const status = getStatusStyle(msg.status || 'Pending');
                            return (
                                <div key={msg._id} className="glass" style={{
                                    padding: '24px 28px',
                                    borderRadius: '20px',
                                    background: msg.isPriority ? 'rgba(239, 68, 68, 0.05)' : (msg.isRead ? 'var(--bg-card)' : 'rgba(255,255,255,0.02)'),
                                    border: msg.isPriority ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--glass-border)',
                                    display: 'flex', flexDirection: 'column'
                                }}>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-main)', flexShrink: 0 }}>{msg.name.charAt(0).toUpperCase()}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <div>
                                                    <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{msg.name}</span>
                                                    <span style={{ marginLeft: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{msg.email}</span>
                                                    <span style={{ marginLeft: '12px', padding: '2px 10px', background: status.bg, color: status.color, borderRadius: '99px', fontSize: '0.72rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{status.icon} {msg.status || 'Pending'}</span>
                                                    {msg.isPriority && <span style={{ marginLeft: '8px', color: '#ef4444', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.05em' }}>★ PRIORITY</span>}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <button onClick={() => togglePriority('contact', msg._id, msg.isPriority)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: msg.isPriority ? '#ef4444' : 'var(--text-secondary)', transition: 'all 0.2s' }}><Flag size={18} fill={msg.isPriority ? '#ef4444' : 'transparent'} /></button>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(msg.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <p style={{ color: 'var(--text-main)', lineHeight: 1.6, margin: '0 0 20px 0', fontSize: '1rem' }}>{msg.message}</p>
                                            
                                            {msg.adminReply && (
                                                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', borderLeft: '4px solid #10b981', marginBottom: '20px', position: 'relative' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>Admin Response</div>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button onClick={() => { setReplyingId(msg._id); setReplyText(msg.adminReply); setReplyStatus(msg.status || 'Resolved'); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 700 }}><TrendingUp size={12} /> Edit</button>
                                                            <button onClick={() => handleDeleteReply('contact', msg._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 700 }}><Trash2 size={12} /> Remove</button>
                                                        </div>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>{msg.adminReply}</p>
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <button onClick={() => { setReplyingId(msg._id); setReplyText(msg.adminReply || ''); setReplyStatus(msg.status || 'Resolved'); }} style={{ padding: '8px 20px', borderRadius: '10px', background: 'rgba(110, 89, 255, 0.1)', color: 'var(--primary)', border: '1px solid rgba(110, 89, 255, 0.2)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>{msg.adminReply ? 'Edit Reply' : 'Reply Now'}</button>
                                                <button onClick={() => handleDeleteContactMessage(msg._id)} style={{ padding: '8px 20px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.1)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Trash2 size={16} /> Delete</button>
                                            </div>
                                            {replyingId === msg._id && renderReplyBox('contact', msg._id)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        );
    };

    const renderRatingsManager = () => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Student Feedback <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>({feedbacks.length} total)</span></h3>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                        {['all', 'pending', 'responded'].map(f => (
                            <button key={f} onClick={() => setAdminStatusFilter(f)} style={{ padding: '8px 20px', borderRadius: '10px', border: 'none', background: adminStatusFilter === f ? 'var(--primary)' : '#ffffff', color: '#000000', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{f}</button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} style={{ padding: '8px 16px', borderRadius: '10px', background: 'var(--bg-card)', color: 'white', border: '1px solid var(--glass-border)', fontSize: '0.85rem' }}><option value="all">Rating: All</option><option value="good">Good (4-5)</option><option value="neutral">Neutral (3)</option><option value="bad">Bad (1-2)</option></select>
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: '8px 16px', borderRadius: '10px', background: 'var(--bg-card)', color: 'white', border: '1px solid var(--glass-border)', fontSize: '0.85rem' }}><option value="All">Dept: All</option><option value="Food">Food</option><option value="Service">Service</option><option value="Delivery">Delivery</option></select>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {feedbacks
                        .filter(fb => (fb.username?.toLowerCase() || fb.studentId?.toLowerCase() || '').includes(globalSearch.toLowerCase()))
                        .filter(fb => categoryFilter === 'All' || (fb.category || 'Food') === categoryFilter)
                        .filter(fb => { if (ratingFilter === 'good') return fb.rating >= 4; if (ratingFilter === 'neutral') return fb.rating === 3; if (ratingFilter === 'bad') return fb.rating <= 2; return true; })
                        .filter(fb => {
                            if (adminStatusFilter === 'pending') return !fb.adminReply;
                            if (adminStatusFilter === 'responded') return !!fb.adminReply;
                            return true;
                        })
                        .sort((a, b) => {
                            if (a.isPriority !== b.isPriority) return b.isPriority ? 1 : -1;
                            return new Date(b.createdAt) - new Date(a.createdAt);
                        })
                        .map(fb => {
                            const status = getStatusStyle(fb.status || 'Pending');
                            return (
                                <div key={fb._id} className="glass" style={{
                                    padding: '24px 28px',
                                    borderRadius: '20px',
                                    background: fb.isPriority ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-card)',
                                    border: fb.isPriority ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--glass-border)',
                                    display: 'flex', flexDirection: 'column'
                                }}>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-main)', flexShrink: 0 }}>{(fb.username||fb.studentId||'U').charAt(0).toUpperCase()}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <div>
                                                    <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>User: {fb.username || fb.studentId}</span>
                                                    <span style={{ marginLeft: '10px', padding: '2px 10px', background: status.bg, color: status.color, borderRadius: '99px', fontSize: '0.72rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{status.icon} {fb.status || 'Pending'}</span>
                                                    {fb.isPriority && <span style={{ marginLeft: '8px', color: '#ef4444', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.05em' }}>★ PRIORITY</span>}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <button onClick={() => togglePriority('feedback', fb._id, fb.isPriority)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: fb.isPriority ? '#ef4444' : 'var(--text-secondary)', transition: 'all 0.2s' }}><Flag size={18} fill={fb.isPriority ? '#ef4444' : 'transparent'} /></button>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(fb.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                                                {[1, 2, 3, 4, 5].map((star) => (<Star key={star} size={14} style={{ fill: fb.rating >= star ? 'var(--primary)' : 'transparent', color: fb.rating >= star ? 'var(--primary)' : 'var(--text-secondary)' }} />))}
                                                <span style={{ marginLeft: '8px', padding: '2px 10px', background: 'rgba(110, 89, 255, 0.1)', color: 'var(--primary)', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 800 }}>{fb.category || 'Food'}</span>
                                                <span style={{ marginLeft: '8px', padding: '2px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', fontSize: '0.7rem', color: fb.sentiment === 'Positive' ? '#10b981' : (fb.sentiment === 'Negative' ? '#ef4444' : '#f59e0b'), fontWeight: 800 }}>{fb.sentiment}</span>
                                            </div>
                                            {fb.comment && (<div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', borderLeft: '3px solid var(--primary)', marginBottom: '20px' }}><p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', fontStyle: 'italic' }}>"{fb.comment}"</p></div>)}
                                            
                                            {fb.imageUrl && (
                                                <div style={{ marginBottom: '20px' }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Attached Photo</div>
                                                    <a href={fb.imageUrl} target="_blank" rel="noopener noreferrer">
                                                        <img 
                                                            src={fb.imageUrl} 
                                                            alt="Feedback" 
                                                            style={{ 
                                                                maxWidth: '300px', 
                                                                maxHeight: '200px', 
                                                                borderRadius: '12px', 
                                                                border: '1px solid var(--glass-border)',
                                                                cursor: 'zoom-in',
                                                                transition: 'transform 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                                                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                                        />
                                                    </a>
                                                </div>
                                            )}

                                            {fb.adminReply && (
                                                <div style={{ padding: '16px', background: 'rgba(16,185,129,0.05)', borderRadius: '16px', borderLeft: '4px solid #10b981', marginBottom: '20px', position: 'relative' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>Admin Response</div>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button onClick={() => { setReplyingId(fb._id); setReplyText(fb.adminReply); setReplyStatus(fb.status || 'Resolved'); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 700 }}><TrendingUp size={12} /> Edit</button>
                                                            <button onClick={() => handleDeleteReply('feedback', fb._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 700 }}><Trash2 size={12} /> Remove</button>
                                                        </div>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>{fb.adminReply}</p>
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <button onClick={() => { setReplyingId(fb._id); setReplyText(fb.adminReply || ''); setReplyStatus(fb.status || 'Resolved'); }} style={{ padding: '8px 20px', borderRadius: '10px', background: 'rgba(110, 89, 255, 0.1)', color: 'var(--primary)', border: '1px solid rgba(110, 89, 255, 0.2)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>{fb.adminReply ? 'Edit Reply' : 'Send Reply'}</button>
                                                <button onClick={() => handleDeleteFeedback(fb._id)} style={{ padding: '8px 20px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.1)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Trash2 size={16} /> Delete</button>
                                            </div>
                                            {replyingId === fb._id && renderReplyBox('feedback', fb._id)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--text-main)', fontFamily: "'Inter', sans-serif" }}>
            <FeedbackSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main style={{ flex: 1, padding: '40px', position: 'relative' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    {renderStatsOverview()}
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            {activeTab === 'messages' && renderMessagesManager()}
                            {activeTab === 'ratings' && renderRatingsManager()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default FeedbackManagement;
