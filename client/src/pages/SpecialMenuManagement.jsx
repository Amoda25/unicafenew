import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, Utensils, Plus, X, Search, Edit2, Trash2, 
    Filter, ChevronRight, Image as ImageIcon, Check, AlertCircle,
    Globe, Info, DollarSign, Tag, Star
} from 'lucide-react';
import axios from 'axios';
import OrderSidebar from '../components/OrderSidebar';

const FormModal = ({ show, onClose, onSubmit, title, isEdit, formData, handleInputChange, validationErrors }) => (
    <AnimatePresence>
        {show && (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(59, 31, 14, 0.1)', backdropFilter: 'blur(12px)', zIndex: 1001 }}
                />
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002, pointerEvents: 'none', padding: '20px' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        style={{ 
                            pointerEvents: 'auto',
                            width: '100%', 
                            maxWidth: '700px', 
                            maxHeight: '90vh', 
                            overflowY: 'auto', 
                            background: '#ffffff', 
                            borderRadius: '24px', 
                            padding: '0', 
                            border: '1px solid #ffffff', 
                            boxShadow: '0 40px 80px -12px rgba(59, 31, 14, 0.3)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                        className="hide-scrollbar"
                    >
                        {/* Header */}
                        <div style={{ 
                            padding: '24px 32px', 
                            background: '#5C3A21',
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            position: 'sticky',
                            top: 0,
                            zIndex: 20,
                            borderTopLeftRadius: '24px',
                            borderTopRightRadius: '24px'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '0 0 8px 0' }}>{title}</h2>
                                <p style={{ fontSize: '0.9rem', color: '#D4C4B7', margin: 0, fontWeight: 500 }}>Fill in the details to register a new special menu item.</p>
                            </div>
                            <button type="button" onClick={onClose} style={{ background: 'rgba(255, 255, 255, 0.15)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={onSubmit} style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                
                                {/* 1. Name */}
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8C6B52', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ITEM NAME (ENG) *</div>
                                    <div style={{ position: 'relative' }}>
                                        <Utensils size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#BCA38F' }} />
                                        <input 
                                            required 
                                            value={formData.name.en} 
                                            onChange={(e) => handleInputChange('name', 'en', e.target.value)} 
                                            style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid #E8E0D8', outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: '#3b1f0e', transition: 'border-color 0.2s' }} 
                                            placeholder="e.g. Classic Beef Burger" 
                                            onFocus={(e) => e.target.style.borderColor = '#8C6B52'}
                                            onBlur={(e) => e.target.style.borderColor = '#E8E0D8'}
                                        />
                                    </div>
                                </div>

                                {/* 2. Description */}
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8C6B52', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DESCRIPTION (ENG)</div>
                                    <div style={{ position: 'relative' }}>
                                        <Info size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: '#BCA38F' }} />
                                        <textarea 
                                            value={formData.description?.en || ''} 
                                            onChange={(e) => handleInputChange('description', 'en', e.target.value)} 
                                            style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: `1px solid ${validationErrors.description ? '#ef4444' : '#E8E0D8'}`, outline: 'none', fontSize: '0.9rem', minHeight: '90px', resize: 'none', fontFamily: 'inherit', color: '#3b1f0e', transition: 'border-color 0.2s', lineHeight: '1.5' }} 
                                            placeholder="Describe the special item..." 
                                            onFocus={(e) => e.target.style.borderColor = validationErrors.description ? '#ef4444' : '#8C6B52'}
                                            onBlur={(e) => e.target.style.borderColor = validationErrors.description ? '#ef4444' : '#E8E0D8'}
                                        />
                                    </div>
                                    {validationErrors.description && (
                                        <p style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <AlertCircle size={14} /> {validationErrors.description}
                                        </p>
                                    )}
                                </div>

                                {/* 3. Price & Image */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8C6B52', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PRICE (LKR) *</div>
                                        <div style={{ position: 'relative' }}>
                                            <DollarSign size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#BCA38F' }} />
                                            <input 
                                                required 
                                                type="text" 
                                                value={formData.price} 
                                                onChange={(e) => handleInputChange('price', null, e.target.value)} 
                                                style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: `1px solid ${validationErrors.price ? '#ef4444' : '#E8E0D8'}`, outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: '#3b1f0e', transition: 'border-color 0.2s' }} 
                                                placeholder="0.00" 
                                                onFocus={(e) => e.target.style.borderColor = validationErrors.price ? '#ef4444' : '#8C6B52'}
                                                onBlur={(e) => e.target.style.borderColor = validationErrors.price ? '#ef4444' : '#E8E0D8'}
                                            />
                                        </div>
                                        {validationErrors.price && (
                                            <p style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <AlertCircle size={14} /> {validationErrors.price}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8C6B52', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>IMAGE URL</div>
                                        <div style={{ position: 'relative' }}>
                                            <ImageIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#BCA38F' }} />
                                            <input 
                                                type="text" 
                                                value={formData.image} 
                                                onChange={(e) => handleInputChange('image', null, e.target.value)} 
                                                style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid #E8E0D8', outline: 'none', fontSize: '0.9rem', color: '#3b1f0e', transition: 'border-color 0.2s' }} 
                                                placeholder="https://..." 
                                                onFocus={(e) => e.target.style.borderColor = '#8C6B52'}
                                                onBlur={(e) => e.target.style.borderColor = '#E8E0D8'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #F1EDE9' }}>
                                <button 
                                    type="button" 
                                    onClick={onClose} 
                                    style={{ padding: '14px 28px', borderRadius: '12px', border: '1px solid #D4C5B9', background: '#ffffff', color: '#8C6B52', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#fcf8f5'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    style={{ padding: '14px 28px', borderRadius: '12px', border: 'none', background: '#5C3A21', color: '#ffffff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(92, 58, 33, 0.2)' }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#4a2f1a'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#5C3A21'}
                                >
                                    {isEdit ? <Save size={18} /> : <Plus size={18} />}
                                    {isEdit ? 'Update Item' : 'Add Special Item'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </>
        )}
    </AnimatePresence>
);

const SpecialMenuManagement = () => {
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const [globalSearch, setGlobalSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showSuccess, setShowSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({ si: '', ta: '', price: '', description: '' });

    const [formData, setFormData] = useState({
        name: { en: '', si: '', ta: '' },
        description: { en: '', si: '', ta: '' },
        price: '',
        category: ['Special Menu'],
        image: '',
        dietary: ['Veg'],
        availability: true
    });

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/menu/all');
            // Filter only Special Menu category
            const specials = response.data.filter(item => 
                Array.isArray(item.category) ? item.category.includes('Special Menu') : item.category === 'Special Menu'
            );
            setMenuItems(specials);
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
            if (englishRegex.test(value)) return 'Please use Sinhala (සිංහල)';
        } else if (lang === 'ta') {
            if (englishRegex.test(value)) return 'Please use Tamil (தமிழ்)';
        }
        return '';
    };

    const handleInputChange = (field, lang, value) => {
        if (lang) {
            if (field === 'name' && (lang === 'si' || lang === 'ta')) {
                const error = validateField(lang, value);
                setValidationErrors(prev => ({ ...prev, [lang]: error }));
            }
            if (field === 'description' && lang === 'en') {
                if (!value.trim()) {
                    setValidationErrors(prev => ({ ...prev, description: 'Description is required.' }));
                } else if (value.trim().length < 10) {
                    setValidationErrors(prev => ({ ...prev, description: 'Please provide a more detailed description (min 10 chars).' }));
                } else {
                    setValidationErrors(prev => ({ ...prev, description: '' }));
                }
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
                    setValidationErrors(prev => ({ ...prev, price: 'Numbers only please (no currency symbols).' }));
                } else if (!onlyNumbers.test(value)) {
                    setValidationErrors(prev => ({ ...prev, price: 'Invalid number format.' }));
                } else if (parseFloat(value) <= 0) {
                    setValidationErrors(prev => ({ ...prev, price: 'Price must be greater than 0.' }));
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
            description: { en: '', si: '', ta: '' },
            price: '',
            category: ['Special Menu'],
            image: '',
            dietary: ['Veg'],
            availability: true
        });
        setValidationErrors({ si: '', ta: '', price: '', description: '' });
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        
        // Manual final check
        if (validationErrors.price || validationErrors.description) {
            alert('Please fix the errors before creating the item.');
            return;
        }

        if (!formData.description.en || formData.description.en.length < 10) {
            setValidationErrors(prev => ({ ...prev, description: 'Please provide a detailed description (min 10 chars).' }));
            return;
        }
        const finalData = {
            ...formData,
            name: {
                en: formData.name.en,
                si: formData.name.en,
                ta: formData.name.en
            },
            description: {
                en: formData.description.en,
                si: formData.description.en,
                ta: formData.description.en
            }
        };

        try {
            await axios.post('/api/menu', finalData);
            setShowSuccess('Special item launched successfully!');
            fetchMenuItems();
            setShowAddModal(false);
            resetForm();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            console.error('Error adding special item:', err);
            alert('Failed to add special item.');
        }
    };

    const handleEditItem = async (e) => {
        e.preventDefault();
        
        // Manual final check
        if (validationErrors.price || validationErrors.description) {
            alert('Please fix the errors before updating the item.');
            return;
        }

        if (!formData.description.en || formData.description.en.length < 10) {
            setValidationErrors(prev => ({ ...prev, description: 'Please provide a detailed description (min 10 chars).' }));
            return;
        }
        const finalData = {
            ...formData,
            name: {
                en: formData.name.en,
                si: formData.name.en,
                ta: formData.name.en
            },
            description: {
                en: formData.description.en,
                si: formData.description.en,
                ta: formData.description.en
            }
        };

        try {
            await axios.put(`/api/menu/${editingItem._id}`, finalData);
            setShowSuccess('Special item updated successfully!');
            fetchMenuItems();
            setShowEditModal(false);
            setEditingItem(null);
            resetForm();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating special item:', err);
            alert('Failed to update special item.');
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Delete this special?')) return;
        try {
            await axios.delete(`/api/menu/${id}`);
            setShowSuccess('Item deleted.');
            fetchMenuItems();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            console.error('Error deleting item:', err);
        }
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            name: { ...item.name },
            description: item.description ? { ...item.description } : { en: '', si: '', ta: '' },
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
        return matchesSearch;
    });

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)', color: '#111827' }}>
            <OrderSidebar activeTab="special-menu" setActiveTab={() => {}} />
            
            <main style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column' }}>
                {/* Page Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button 
                            onClick={() => navigate('/orders')}
                            style={{ 
                                padding: '12px', 
                                borderRadius: '14px', 
                                background: 'white', 
                                border: '1px solid #e2e8f0', 
                                color: '#64748b', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>Special Menu Hub</h1>
                            <p style={{ color: '#64748b', fontWeight: 500, margin: '4px 0 0' }}>Manage limited-time and featured campus delicacies</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => { resetForm(); setShowAddModal(true); }} 
                        className="btn-premium" 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            padding: '14px 28px', 
                            borderRadius: '18px',
                            background: 'linear-gradient(135deg, var(--coffee-dark) 0%, #3b1f0e 100%)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 800,
                            boxShadow: '0 10px 25px rgba(59, 31, 14, 0.2)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 15px 35px rgba(59, 31, 14, 0.3)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 31, 14, 0.2)';
                        }}
                    >
                        <div style={{ 
                            width: '30px', 
                            height: '30px', 
                            borderRadius: '50%', 
                            background: 'rgba(255,255,255,0.2)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <Plus size={20} />
                        </div>
                        <span style={{ letterSpacing: '0.5px' }}>ADD TODAY'S SPECIAL</span>
                    </button>
                </div>

                {/* Search */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Find a special..." 
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', background: 'white' }}
                        />
                    </div>
                </div>

                {/* Main Content */}
                {loading ? (
                    <div style={{ padding: '100px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
                ) : filteredItems.length === 0 ? (
                    <div style={{ background: 'white', borderRadius: '24px', padding: '100px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                        <Star size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                        <p style={{ color: '#94a3b8', fontWeight: 600 }}>No special menu items currently active.</p>
                        <button onClick={() => setShowAddModal(true)} style={{ marginTop: '20px', color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                            Create your first special menu item →
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
                        {filteredItems.map(item => (
                            <motion.div
                                key={item._id}
                                whileHover={{ y: -5 }}
                                style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}
                            >
                                <div style={{ height: '200px', position: 'relative' }}>
                                    <img src={item.image || 'https://via.placeholder.com/400x200'} alt={item.name.en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.9)', padding: '5px 12px', borderRadius: '50px', fontWeight: 800, fontSize: '0.9rem' }}>
                                        LKR {item.price}
                                    </div>
                                    {!item.availability && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>
                                            OFFLINE
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px' }}>{item.name.en}</h3>
                                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>{item.name.si} • {item.name.ta}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {item.dietary?.includes('Veg') && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />}
                                            {item.dietary?.includes('Non-Veg') && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f43f5e' }} />}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                        <button onClick={() => openEditModal(item)} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}>
                                            <Edit2 size={16} /> Edit
                                        </button>
                                        <button onClick={() => handleDeleteItem(item._id)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#ef4444', cursor: 'pointer' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            <FormModal 
                show={showAddModal} 
                onClose={() => setShowAddModal(false)} 
                onSubmit={handleAddItem} 
                title="Create Special Menu" 
                isEdit={false} 
                formData={formData}
                handleInputChange={handleInputChange}
                validationErrors={validationErrors}
            />
            <FormModal 
                show={showEditModal} 
                onClose={() => { setShowEditModal(false); setEditingItem(null); resetForm(); }} 
                onSubmit={handleEditItem} 
                title="Modify Special" 
                isEdit={true} 
                formData={formData}
                handleInputChange={handleInputChange}
                validationErrors={validationErrors}
            />

            {showSuccess && (
                <div style={{ position: 'fixed', bottom: '40px', right: '40px', background: '#10b981', padding: '16px 25px', borderRadius: '16px', color: 'white', fontWeight: 700, zIndex: 3000, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Check size={20} /> {showSuccess}
                </div>
            )}
        </div>
    );
};

export default SpecialMenuManagement;
