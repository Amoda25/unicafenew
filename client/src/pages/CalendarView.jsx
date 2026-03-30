import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, Trash2, X, Save, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CalendarView = ({ isEmbedded = false }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [menuItems, setMenuItems] = useState([]);
    const [events, setEvents] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [eventData, setEventData] = useState({
        type: 'event',
        title: '',
        desc: ''
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = ['admin', 'staff'].includes(user.role);

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    useEffect(() => {
        fetchMenu();
        fetchEvents();
    }, []);

    const fetchMenu = async () => {
        try {
            const response = await axios.get('/api/menu/all'); // Corrected endpoint
            setMenuItems(response.data);
        } catch (err) {
            console.error('Error fetching menu:', err);
        }
    };

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/calendar/events');
            const eventsMap = {};
            response.data.forEach(event => {
                eventsMap[event.date] = event;
            });
            setEvents(eventsMap);
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        const dateKey = formatDateKey(selectedDate.getDate());
        try {
            await axios.post('/api/calendar/events', {
                ...eventData,
                date: dateKey
            });
            setShowModal(false);
            setEventData({ type: 'event', title: '', desc: '' });
            fetchEvents();
        } catch (err) {
            alert('Failed to add event');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await axios.delete(`/api/calendar/events/${eventId}`);
            fetchEvents();
        } catch (err) {
            alert('Failed to delete event');
        }
    };

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const changeMonth = (offset) => {
        const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(nextDate);
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);

    const isToday = (day) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    };

    const isSelected = (day) => {
        return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
    };

    const formatDateKey = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const selectedDateKey = formatDateKey(selectedDate.getDate());
    const dayEvent = events[selectedDateKey];
    const selectedDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(selectedDate);

    return (
        <div className="calendar-view" style={{ padding: isEmbedded ? '0' : '2rem 5%', minHeight: isEmbedded ? 'auto' : '100vh', background: isEmbedded ? 'transparent' : 'var(--bg-page)' }}>
            {(!isEmbedded && isAdmin) && (
                <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 900 }}>
                            Canteen <span className="gradient-text">Pulse Calendar</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Stay updated with daily menus and special cafeteria events.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className="glass" style={{ padding: '0.5rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Special Event</span>
                        </div>
                        <div className="glass" style={{ padding: '0.5rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Canteen Closed</span>
                        </div>
                    </div>
                </div>
            )}

            {!isAdmin && !isEmbedded && (
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>Cafeteria Schedule</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Check menus and events below</p>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
                {/* Calendar Grid */}
                <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <CalendarIcon size={24} color="var(--primary)" />
                            {monthName} <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{year}</span>
                        </h2>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => changeMonth(-1)} className="glass hover-scale" style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--text-main)', background: 'none' }}>
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={() => changeMonth(1)} className="glass hover-scale" style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--text-main)', background: 'none' }}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px', textAlign: 'center' }}>
                        {daysOfWeek.map(day => (
                            <div key={day} style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', paddingBottom: '12px' }}>
                                {day.toUpperCase()}
                            </div>
                        ))}

                        {/* Empty slots for first day offset */}
                        {[...Array(firstDay)].map((_, i) => (
                            <div key={`empty-${i}`} style={{ aspectRatio: '1/1' }} />
                        ))}

                        {[...Array(daysInMonth)].map((_, i) => {
                            const d = i + 1;
                            const dateKey = formatDateKey(d);
                            const event = events[dateKey];
                            const selected = isSelected(d);
                            const today = isToday(d);

                            const handleCellClick = () => {
                                const newDate = new Date(year, month, d);
                                setSelectedDate(newDate);
                                if (isAdmin && !event) {
                                    setShowModal(true);
                                }
                            };

                            return (
                                <motion.div
                                    key={d}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    onClick={handleCellClick}
                                    style={{
                                        aspectRatio: '1/1',
                                        borderRadius: '16px',
                                        padding: '5px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        background: selected ? 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)' : 'rgba(15, 23, 42, 0.03)',
                                        border: today ? '2px solid var(--primary)' : '1px solid transparent',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <span style={{
                                        fontSize: '1.25rem',
                                        fontWeight: 800,
                                        color: selected ? 'var(--text-main)' : (today ? 'var(--primary)' : 'var(--text-main)')
                                    }}>
                                        {d}
                                    </span>
                                    
                                    {isAdmin && !event && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            whileHover={{ opacity: 1, scale: 1 }}
                                            style={{
                                                position: 'absolute',
                                                top: '5px',
                                                right: '5px',
                                                width: '24px',
                                                height: '24px',
                                                background: 'var(--primary)',
                                                borderRadius: '6px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <Plus size={14} strokeWidth={3} />
                                        </motion.div>
                                    )}

                                    {event && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '8px',
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: event.type === 'closing' ? '#ef4444' : '#f59e0b',
                                            boxShadow: `0 0 10px ${event.type === 'closing' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.5)'}`
                                        }} />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Event & Menu Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <motion.div
                        key={selectedDateKey}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass"
                        style={{ padding: '2.5rem', borderRadius: '32px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>
                                {selectedDayName}, {monthName} {selectedDate.getDate()}
                            </h3>
                            {isAdmin && !dayEvent && (
                                <button 
                                    onClick={() => setShowModal(true)}
                                    style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <Plus size={14} /> Add Event
                                </button>
                            )}
                        </div>

                        {dayEvent ? (
                            <div style={{
                                padding: '1.5rem',
                                borderRadius: '20px',
                                background: dayEvent.type === 'closing' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                border: `1px solid ${dayEvent.type === 'closing' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                                marginTop: '1.5rem',
                                position: 'relative'
                            }}>
                                {isAdmin && (
                                    <button 
                                        onClick={() => handleDeleteEvent(dayEvent._id)}
                                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: dayEvent.type === 'closing' ? '#ef4444' : '#f59e0b' }} />
                                    <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', color: dayEvent.type === 'closing' ? '#ef4444' : '#f59e0b' }}>
                                        {dayEvent.type === 'closing' ? 'Canteen Closed' : 'Special Event'}
                                    </span>
                                </div>
                                <h4 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '4px' }}>{dayEvent.title}</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{dayEvent.desc}</p>
                            </div>
                        ) : (
                            <div style={{ marginTop: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                                    <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', color: '#10b981' }}>
                                        Canteen Open
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {['Breakfast', 'Lunch', 'Dinner'].map(meal => (
                                        <div key={meal} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(59, 10, 0, 0.03)', borderRadius: '12px' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{meal}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Available</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!dayEvent && (
                            <button className="btn-premium" style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}>
                                <Link to="/order" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    Pre-order Meal <Plus size={18} />
                                </Link>
                            </button>
                        )}
                    </motion.div>

                    <div className="glass" style={{ padding: '2rem', borderRadius: '32px', background: 'white', border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.2rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0f2fe', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertCircle size={18} />
                            </div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Admin Notes</h4>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.7, fontWeight: 500 }}>
                            {dayEvent?.desc || "Evening snacks are available daily from 3:30 PM to 6:00 PM. Weekend menus may vary based on ingredient availability."}
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Form Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000 }}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 0 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 0 }}
                            style={{ 
                                position: 'fixed', 
                                top: '10%', 
                                left: '50%', 
                                transform: 'translateX(-50%)', 
                                width: '90%', 
                                maxWidth: '450px', 
                                maxHeight: '85vh',
                                overflowY: 'auto',
                                background: 'white', 
                                borderRadius: '24px', 
                                padding: '2.5rem', 
                                zIndex: 1001, 
                                boxShadow: '0 20px 40px rgba(0,0,0,0.2)' 
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>Mark Special Date</h3>
                                <X onClick={() => setShowModal(false)} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} />
                            </div>

                            <form onSubmit={handleAddEvent}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.875rem' }}>Date</label>
                                    <div className="glass" style={{ padding: '12px 16px', borderRadius: '12px', background: '#f8fafc', fontWeight: 600 }}>
                                        {selectedDateKey}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.875rem' }}>Type</label>
                                    <select 
                                        value={eventData.type}
                                        onChange={(e) => setEventData({ ...eventData, type: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 600 }}
                                    >
                                        <option value="event">Special Event</option>
                                        <option value="closing">Canteen Closed</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.875rem' }}>Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={eventData.title}
                                        onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                                        placeholder="e.g. Sinhala New Year"
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.875rem' }}>Description</label>
                                    <textarea 
                                        value={eventData.desc}
                                        onChange={(e) => setEventData({ ...eventData, desc: e.target.value })}
                                        placeholder="Brief details about the event..."
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '100px', resize: 'none', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" className="btn-premium" style={{ flex: 1, padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                        <Save size={18} /> Save Marker
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CalendarView;
