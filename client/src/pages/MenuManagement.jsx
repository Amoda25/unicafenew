import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, Utensils, Plus, X, Search, Edit2, Trash2, 
    Filter, ChevronRight, Image as ImageIcon, Check, AlertCircle,
    Globe, Info, DollarSign, Tag
} from 'lucide-react';
import axios from 'axios';
import OrderSidebar from '../components/OrderSidebar';

const FormModal = ({ show, onClose, onSubmit, title, isEdit, formData, handleInputChange, categories, validationErrors }) => (
    <AnimatePresence>
        {show && (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 1001 }}
                />
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1002, pointerEvents: 'none', padding: '40px 20px' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        style={{ 
                            pointerEvents: 'auto',
                            width: '100%', 
                            maxWidth: '850px', 
                            maxHeight: '90vh', 
                            overflowY: 'auto', 
                            background: 'var(--latte-card)', 
                            borderRadius: '24px', 
                            padding: '0', 
                            border: '1px solid #e2e8f0', 
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' 
                        }}
                        className="hide-scrollbar"
                    >
                        {/* Modal Header */}
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--latte-card)', zIndex: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255, 199, 44, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    <Plus size={20} />
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{title}</h2>
                            </div>
                            <button onClick={onClose} style={{ background: '#f8fafc', border: 'none', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={onSubmit} style={{ padding: '32px' }}>
                            {/* Multi-language Names */}
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    <Globe size={16} /> Item Name (Multi-language)
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>English</label>
                                        <input required value={formData.name.en} onChange={(e) => handleInputChange('name', 'en', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }} placeholder="e.g. Chicken Burger" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>Sinhala</label>
                                        <input 
                                            required 
                                            value={formData.name.si} 
                                            onChange={(e) => handleInputChange('name', 'si', e.target.value)} 
                                            style={{ 
                                                width: '100%', 
                                                padding: '12px 16px', 
                                                borderRadius: '12px', 
                                                border: `1px solid ${validationErrors?.si ? '#f43f5e' : '#e2e8f0'}`, 
                                                outline: 'none', 
                                                fontSize: '0.9rem',
                                                transition: 'all 0.2s'
                                            }} 
                                            placeholder="චිකන් බර්ගර්" 
                                        />
                                        {validationErrors?.si && (
                                            <div style={{ color: '#f43f5e', fontSize: '0.7rem', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <AlertCircle size={12} /> {validationErrors.si}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>Tamil</label>
                                        <input 
                                            required 
                                            value={formData.name.ta} 
                                            onChange={(e) => handleInputChange('name', 'ta', e.target.value)} 
                                            style={{ 
                                                width: '100%', 
                                                padding: '12px 16px', 
                                                borderRadius: '12px', 
                                                border: `1px solid ${validationErrors?.ta ? '#f43f5e' : '#e2e8f0'}`, 
                                                outline: 'none', 
                                                fontSize: '0.9rem',
                                                transition: 'all 0.2s'
                                            }} 
                                            placeholder="சிக்கன் பர்கர்" 
                                        />
                                        {validationErrors?.ta && (
                                            <div style={{ color: '#f43f5e', fontSize: '0.7rem', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <AlertCircle size={12} /> {validationErrors.ta}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Basic Info Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        <DollarSign size={16} /> Pricing & Category
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>Price (LKR)</label>
                                            <input 
                                                required 
                                                type="text" 
                                                value={formData.price} 
                                                onChange={(e) => handleInputChange('price', null, e.target.value)} 
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '12px 16px', 
                                                    borderRadius: '12px', 
                                                    border: `1px solid ${validationErrors?.price ? '#f43f5e' : '#e2e8f0'}`, 
                                                    outline: 'none', 
                                                    fontSize: '0.9rem',
                                                    transition: 'all 0.2s'
                                                }} 
                                                placeholder="0.00" 
                                            />
                                            {validationErrors?.price && (
                                                <div style={{ color: '#f43f5e', fontSize: '0.7rem', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <AlertCircle size={12} /> {validationErrors.price}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>Available In (Categories)</label>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                                                {categories.map(cat => (
                                                    <label key={cat} style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '6px', 
                                                        padding: '6px 12px', 
                                                        borderRadius: '8px', 
                                                        background: formData.category.includes(cat) ? 'rgba(255, 199, 44, 0.2)' : '#f8fafc', 
                                                        border: `1px solid ${formData.category.includes(cat) ? 'var(--primary)' : '#e2e8f0'}`,
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 700,
                                                        color: formData.category.includes(cat) ? '#BA8B00' : '#64748b',
                                                        transition: 'all 0.2s'
                                                    }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={formData.category.includes(cat)} 
                                                            onChange={() => {
                                                                const newCats = formData.category.includes(cat)
                                                                    ? formData.category.filter(c => c !== cat)
                                                                    : [...formData.category, cat];
                                                                handleInputChange('category', null, newCats);
                                                            }}
                                                            style={{ display: 'none' }}
                                                        />
                                                        {cat}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        <ImageIcon size={16} /> Media
                                    </h3>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>Image URL</label>
                                    <input type="text" value={formData.image} onChange={(e) => handleInputChange('image', null, e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }} placeholder="https://images.unsplash.com/..." />
                                </div>
                            </div>

                            {/* Dietary Options & Availability */}
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    <Tag size={16} /> Dietary & Status
                                </h3>
                                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', gap: '32px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={formData.dietary.includes('Veg')} 
                                                onChange={() => {
                                                    const newDietary = formData.dietary.includes('Veg')
                                                        ? formData.dietary.filter(d => d !== 'Veg')
                                                        : [...formData.dietary, 'Veg'];
                                                    handleInputChange('dietary', null, newDietary);
                                                }}
                                                style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                                            />
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Vegetarian Option</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={formData.dietary.includes('Non-Veg')} 
                                                onChange={() => {
                                                    const newDietary = formData.dietary.includes('Non-Veg')
                                                        ? formData.dietary.filter(d => d !== 'Non-Veg')
                                                        : [...formData.dietary, 'Non-Veg'];
                                                    handleInputChange('dietary', null, newDietary);
                                                }}
                                                style={{ width: '18px', height: '18px', accentColor: '#f43f5e' }}
                                            />
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Non-Vegetarian Option</span>
                                        </label>
                                    </div>

                                    <div style={{ height: '1px', background: '#e2e8f0' }} />

                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                        <div 
                                            onClick={() => handleInputChange('availability', null, !formData.availability)}
                                            style={{ width: '44px', height: '24px', borderRadius: '12px', background: formData.availability ? 'var(--primary)' : '#cbd5e1', position: 'relative', transition: 'all 0.3s' }}
                                        >
                                            <div style={{ position: 'absolute', top: '3px', left: formData.availability ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--latte-card)', transition: 'all 0.3s' }} />
                                        </div>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Live on Ordering Page</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="btn-premium" style={{ width: '100%', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '1rem' }}>
                                <Save size={20} /> {isEdit ? 'Update Menu Item' : 'Create Menu Item'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </>
        )}
    </AnimatePresence>
);

const MenuManagement = () => {
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const [globalSearch, setGlobalSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showSuccess, setShowSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({ si: '', ta: '', price: '' });

    const [formData, setFormData] = useState({
        name: { en: '', si: '', ta: '' },
        price: '',
        category: [],
        image: '',
        dietary: ['Veg'],
        availability: true
    });

    const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Special Menu'];

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/menu/all');
            setMenuItems(response.data);
        } catch (err) {
            console.error('Error fetching menu:', err);
        } finally {
            setLoading(false);
        }
    };

    const validateField = (lang, value) => {
        if (!value) return '';
        const englishRegex = /[a-zA-Z]/;
        if (lang === 'si') {
            if (englishRegex.test(value)) {
                return 'Please use Sinhala (සිංහල)';
            }
        } else if (lang === 'ta') {
            if (englishRegex.test(value)) {
                return 'Please use Tamil (தமிழ்)';
            }
        }
        return '';
    };

    const handleInputChange = (field, lang, value) => {
        if (lang) {
            if (field === 'name' && (lang === 'si' || lang === 'ta')) {
                const error = validateField(lang, value);
                setValidationErrors(prev => ({ ...prev, [lang]: error }));
            }
            setFormData(prev => ({
                ...prev,
                [field]: { ...prev[field], [lang]: value }
            }));
        } else {
            if (field === 'price') {
                const currencyChars = /[$£€¥₹]|Rs|LKR/i;
                const onlyNumbers = /^[0-9]*\.?[0-9]*$/;
                
                if (currencyChars.test(value)) {
                    setValidationErrors(prev => ({ ...prev, price: 'Currency symbols are not allowed. Please enter numbers only.' }));
                } else if (!onlyNumbers.test(value)) {
                    setValidationErrors(prev => ({ ...prev, price: 'Please enter a valid number (e.g. 100 or 100.50).' }));
                } else {
                    setValidationErrors(prev => ({ ...prev, price: '' }));
                }
            }
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const resetForm = () => {
        setFormData({
            name: { en: '', si: '', ta: '' },
            price: '',
            category: [],
            image: '',
            dietary: ['Veg'],
            availability: true
        });
        setValidationErrors({ si: '', ta: '', price: '' });
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        
        if (validationErrors.si || validationErrors.ta || validationErrors.price) {
            alert('Please fix the validation errors before submitting.');
            return;
        }

        try {
            await axios.post('/api/menu', formData);
            setShowSuccess('Menu item created successfully!');
            setShowAddModal(false);
            resetForm();
            fetchMenuItems();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            console.error('Error adding item:', err);
            alert('Failed to add item. Please check all required fields.');
        }
    };

    const handleEditItem = async (e) => {
        e.preventDefault();

        if (validationErrors.si || validationErrors.ta || validationErrors.price) {
            alert('Please fix the validation errors before submitting.');
            return;
        }

        try {
            await axios.put(`/api/menu/${editingItem._id}`, formData);
            setShowSuccess('Menu item updated successfully!');
            setShowEditModal(false);
            setEditingItem(null);
            resetForm();
            fetchMenuItems();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating item:', err);
            alert('Failed to update item.');
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;
        try {
            await axios.delete(`/api/menu/${id}`);
            setShowSuccess('Item deleted successfully!');
            fetchMenuItems();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            console.error('Error deleting item:', err);
            alert('Failed to delete item.');
        }
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            name: { ...item.name },
            price: item.price,
            category: Array.isArray(item.category) ? item.category : [item.category],
            image: item.image || '',
            dietary: Array.isArray(item.dietary) ? item.dietary : (item.isVeg ? ['Veg'] : ['Non-Veg']),
            availability: item.availability !== undefined ? item.availability : true
        });
        setShowEditModal(true);
    };

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = 
            (item.name?.en?.toLowerCase() || '').includes(globalSearch.toLowerCase()) ||
            (item.name?.si?.toLowerCase() || '').includes(globalSearch.toLowerCase()) ||
            (item.name?.ta?.toLowerCase() || '').includes(globalSearch.toLowerCase());
        const matchesCategory = activeCategory === 'All' || (Array.isArray(item.category) && item.category.includes(activeCategory));
        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)', color: '#111827' }}>
            <OrderSidebar activeTab="menu" setActiveTab={() => {}} />
            
            <main style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column' }}>
                {/* Page Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button 
                            onClick={() => navigate('/orders')}
                            style={{ 
                                padding: '12px', 
                                borderRadius: '14px', 
                                background: 'var(--latte-card)', 
                                border: '1px solid #e2e8f0', 
                                color: '#64748b', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseOut={e => e.currentTarget.style.background = 'white'}
                        >
                            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>Menu Items Dashboard</h1>
                            <p style={{ color: '#64748b', fontWeight: 500, margin: '4px 0 0' }}>Part of Order Management Subsystem</p>
                        </div>
                    </div>
                    <button onClick={() => { resetForm(); setShowAddModal(true); }} className="btn-premium" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={20} /> Add New Item
                    </button>
                </div>

                {/* Stats Summary Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ padding: '24px', borderRadius: '20px', background: 'var(--latte-card)', border: '1px solid #f1f5f9' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Total Items</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{menuItems.length}</div>
                    </div>
                    <div style={{ padding: '24px', borderRadius: '20px', background: 'var(--latte-card)', border: '1px solid #f1f5f9' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Live Items</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{menuItems.filter(i => i.availability).length}</div>
                    </div>
                    <div style={{ padding: '24px', borderRadius: '20px', background: 'var(--latte-card)', border: '1px solid #f1f5f9' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Vegetarian</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{menuItems.filter(i => i.dietary?.includes('Veg')).length}</div>
                    </div>
                    <div style={{ padding: '24px', borderRadius: '20px', background: 'var(--latte-card)', border: '1px solid #f1f5f9' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Categories</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>5</div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {['All', ...categories].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: '99px',
                                    background: activeCategory === cat ? 'var(--primary)' : 'white',
                                    color: activeCategory === cat ? 'white' : '#64748b',
                                    border: '1px solid #e2e8f0',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search menu..." 
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', background: 'var(--latte-card)' }}
                        />
                    </div>
                </div>

                {/* Main Table */}
                <div style={{ background: 'var(--latte-card)', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Item Name</th>
                                <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Category</th>
                                <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Price</th>
                                <th style={{ padding: '20px 24px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '20px 24px', textAlign: 'right', color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '100px', textAlign: 'center', color: '#94a3b8' }}>Loading menu items...</td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '100px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                            <Utensils size={48} style={{ opacity: 0.1 }} />
                                            <p style={{ color: '#94a3b8', fontWeight: 600 }}>No menu items found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredItems.map((item) => (
                                <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fcfcfc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name.en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                                        <ImageIcon size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <span style={{ fontWeight: 800, color: '#1e293b' }}>{item.name.en}</span>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        {item.dietary?.includes('Veg') && <div style={{ width: '14px', height: '14px', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Vegetarian"><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /></div>}
                                                        {item.dietary?.includes('Non-Veg') && <div style={{ width: '14px', height: '14px', border: '1px solid #f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Non-Vegetarian"><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f43f5e' }} /></div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {(Array.isArray(item.category) ? item.category : [item.category]).map(c => (
                                                <span key={c} style={{ padding: '4px 10px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', fontSize: '0.7rem', fontWeight: 800 }}>{c}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: 800, color: '#1e293b' }}>LKR {item.price}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.availability ? '#10b981' : '#f43f5e' }} />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: item.availability ? '#059669' : '#e11d48' }}>{item.availability ? 'LIVE' : 'OFFLINE'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button onClick={() => openEditModal(item)} style={{ padding: '8px', borderRadius: '10px', background: 'var(--latte-card)', border: '1px solid #e2e8f0', color: '#3b82f6', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#eff6ff'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteItem(item._id)} style={{ padding: '8px', borderRadius: '10px', background: 'var(--latte-card)', border: '1px solid #e2e8f0', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fef2f2'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            <FormModal 
                show={showAddModal} 
                onClose={() => setShowAddModal(false)} 
                onSubmit={handleAddItem} 
                title="Add New Menu Item" 
                isEdit={false} 
                formData={formData}
                handleInputChange={handleInputChange}
                categories={categories}
                validationErrors={validationErrors}
            />
            <FormModal 
                show={showEditModal} 
                onClose={() => { setShowEditModal(false); setEditingItem(null); resetForm(); }} 
                onSubmit={handleEditItem} 
                title="Edit Menu Item" 
                isEdit={true} 
                formData={formData}
                handleInputChange={handleInputChange}
                categories={categories}
                validationErrors={validationErrors}
            />

            {showSuccess && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ position: 'fixed', bottom: '40px', right: '40px', background: '#10b981', padding: '16px 25px', borderRadius: '16px', color: 'white', fontWeight: 700, zIndex: 3000, boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                    <Check size={20} />
                    {showSuccess}
                </motion.div>
            )}

            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default MenuManagement;
