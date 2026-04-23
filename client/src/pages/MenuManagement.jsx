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
                            maxWidth: '850px', 
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
                                <p style={{ fontSize: '0.9rem', color: '#D4C4B7', margin: 0, fontWeight: 500 }}>Fill in the details to register a new menu item.</p>
                            </div>
                            <button type="button" onClick={onClose} style={{ background: 'rgba(255, 255, 255, 0.15)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={onSubmit} style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                
                                {/* 1. Name Section */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8C6B52', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ITEM NAME (ENG) *</div>
                                        <div style={{ position: 'relative' }}>
                                            <Utensils size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#BCA38F' }} />
                                            <input 
                                                required 
                                                value={formData.name.en} 
                                                onChange={(e) => handleInputChange('name', 'en', e.target.value)} 
                                                style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid #E8E0D8', outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: '#3b1f0e', transition: 'border-color 0.2s' }} 
                                                placeholder="e.g. Rice and Curry" 
                                                onFocus={(e) => e.target.style.borderColor = '#8C6B52'}
                                                onBlur={(e) => e.target.style.borderColor = '#E8E0D8'}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8C6B52', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ITEM NAME (SIN)</div>
                                        <div style={{ position: 'relative' }}>
                                            <Utensils size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#BCA38F' }} />
                                            <input 
                                                value={formData.name.si} 
                                                onChange={(e) => handleInputChange('name', 'si', e.target.value)} 
                                                style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: `1px solid ${validationErrors.si ? '#ef4444' : '#E8E0D8'}`, outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: '#3b1f0e', transition: 'border-color 0.2s' }} 
                                                placeholder="උදා: බත් සහ වෑංජන" 
                                                onFocus={(e) => e.target.style.borderColor = validationErrors.si ? '#ef4444' : '#8C6B52'}
                                                onBlur={(e) => e.target.style.borderColor = validationErrors.si ? '#ef4444' : '#E8E0D8'}
                                            />
                                        </div>
                                        {validationErrors.si && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontWeight: 600 }}>{validationErrors.si}</p>}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8C6B52', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ITEM NAME (TAM)</div>
                                        <div style={{ position: 'relative' }}>
                                            <Utensils size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#BCA38F' }} />
                                            <input 
                                                value={formData.name.ta} 
                                                onChange={(e) => handleInputChange('name', 'ta', e.target.value)} 
                                                style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: `1px solid ${validationErrors.ta ? '#ef4444' : '#E8E0D8'}`, outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: '#3b1f0e', transition: 'border-color 0.2s' }} 
                                                placeholder="எ.கா. சோறு மற்றும் கறி" 
                                                onFocus={(e) => e.target.style.borderColor = validationErrors.ta ? '#ef4444' : '#8C6B52'}
                                                onBlur={(e) => e.target.style.borderColor = validationErrors.ta ? '#ef4444' : '#E8E0D8'}
                                            />
                                        </div>
                                        {validationErrors.ta && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontWeight: 600 }}>{validationErrors.ta}</p>}
                                    </div>
                                </div>

                                {/* 2. Description Section */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8C6B52', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DESCRIPTION (ENG)</div>
                                        <div style={{ position: 'relative' }}>
                                            <Info size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: '#BCA38F' }} />
                                            <textarea 
                                                value={formData.description?.en || ''} 
                                                onChange={(e) => handleInputChange('description', 'en', e.target.value)} 
                                                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: `1px solid ${validationErrors.description ? '#ef4444' : '#E8E0D8'}`, outline: 'none', fontSize: '0.9rem', minHeight: '90px', resize: 'none', fontFamily: 'inherit', color: '#3b1f0e', transition: 'border-color 0.2s', lineHeight: '1.5' }} 
                                                placeholder="Describe in English..." 
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
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8C6B52', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DESCRIPTION (SIN)</div>
                                        <div style={{ position: 'relative' }}>
                                            <Info size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: '#BCA38F' }} />
                                            <textarea 
                                                value={formData.description?.si || ''} 
                                                onChange={(e) => handleInputChange('description', 'si', e.target.value)} 
                                                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: `1px solid ${validationErrors.descSi ? '#ef4444' : '#E8E0D8'}`, outline: 'none', fontSize: '0.9rem', minHeight: '90px', resize: 'none', fontFamily: 'inherit', color: '#3b1f0e', transition: 'border-color 0.2s', lineHeight: '1.5' }} 
                                                placeholder="සිංහලෙන් විස්තරය..." 
                                                onFocus={(e) => e.target.style.borderColor = validationErrors.descSi ? '#ef4444' : '#8C6B52'}
                                                onBlur={(e) => e.target.style.borderColor = validationErrors.descSi ? '#ef4444' : '#E8E0D8'}
                                            />
                                        </div>
                                        {validationErrors.descSi && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontWeight: 600 }}>{validationErrors.descSi}</p>}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8C6B52', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DESCRIPTION (TAM)</div>
                                        <div style={{ position: 'relative' }}>
                                            <Info size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: '#BCA38F' }} />
                                            <textarea 
                                                value={formData.description?.ta || ''} 
                                                onChange={(e) => handleInputChange('description', 'ta', e.target.value)} 
                                                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: `1px solid ${validationErrors.descTa ? '#ef4444' : '#E8E0D8'}`, outline: 'none', fontSize: '0.9rem', minHeight: '90px', resize: 'none', fontFamily: 'inherit', color: '#3b1f0e', transition: 'border-color 0.2s', lineHeight: '1.5' }} 
                                                placeholder="தமிழில் விளக்கம்..." 
                                                onFocus={(e) => e.target.style.borderColor = validationErrors.descTa ? '#ef4444' : '#8C6B52'}
                                                onBlur={(e) => e.target.style.borderColor = validationErrors.descTa ? '#ef4444' : '#E8E0D8'}
                                            />
                                        </div>
                                        {validationErrors.descTa && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontWeight: 600 }}>{validationErrors.descTa}</p>}
                                    </div>
                                </div>

                                {/* 3. Price & Image Section */}
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
                                            <div style={{ position: 'absolute', top: '3px', left: formData.availability ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#ffffff', transition: 'all 0.3s' }} />
                                        </div>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Live on Ordering Page</span>
                                    </label>
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
                                    {isEdit ? 'Update Menu Item' : 'Add Menu Item'}
                                </button>
                            </div>
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
    const [validationErrors, setValidationErrors] = useState({ si: '', ta: '', descSi: '', descTa: '', price: '', description: '' });

    const [formData, setFormData] = useState({
        name: { en: '', si: '', ta: '' },
        description: { en: '', si: '', ta: '' },
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
            if (lang === 'si' || lang === 'ta') {
                const error = validateField(lang, value);
                if (field === 'name') {
                    setValidationErrors(prev => ({ ...prev, [lang]: error }));
                } else if (field === 'description') {
                    const descLangKey = lang === 'si' ? 'descSi' : 'descTa';
                    setValidationErrors(prev => ({ ...prev, [descLangKey]: error }));
                }
            }
            if (field === 'description' && lang === 'en') {
                if (!value.trim()) {
                    setValidationErrors(prev => ({ ...prev, description: 'Description is required.' }));
                } else if (value.trim().length < 10) {
                    setValidationErrors(prev => ({ ...prev, description: 'Description should be at least 10 characters.' }));
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
                    setValidationErrors(prev => ({ ...prev, price: 'Currency symbols are not allowed. Numbers only.' }));
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
            category: [],
            image: '',
            dietary: ['Veg'],
            availability: true
        });
        setValidationErrors({ si: '', ta: '', descSi: '', descTa: '', price: '', description: '' });
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        
        if (validationErrors.price || validationErrors.description || validationErrors.si || validationErrors.ta || validationErrors.descSi || validationErrors.descTa) {
            alert('Please fix validation errors before submitting.');
            return;
        }

        if (!formData.description.en || formData.description.en.length < 10) {
            setValidationErrors(prev => ({ ...prev, description: 'Please provide a detailed description (min 10 chars).' }));
            return;
        }
        const finalData = {
            ...formData,
            // Default category to Lunch if none selected
            category: formData.category.length > 0 ? formData.category : ['Lunch']
        };

        try {
            await axios.post('/api/menu', finalData);
            setShowSuccess('Menu item added successfully!');
            fetchMenuItems();
            setShowAddModal(false);
            resetForm();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            console.error('Error adding item:', err);
            alert('Failed to add menu item.');
        }
    };

    const handleEditItem = async (e) => {
        e.preventDefault();
        
        if (validationErrors.price || validationErrors.description || validationErrors.si || validationErrors.ta || validationErrors.descSi || validationErrors.descTa) {
            alert('Please fix validation errors before submitting.');
            return;
        }

        if (!formData.description.en || formData.description.en.length < 10) {
            setValidationErrors(prev => ({ ...prev, description: 'Please provide a detailed description (min 10 chars).' }));
            return;
        }
        const finalData = {
            ...formData
        };

        try {
            await axios.put(`/api/menu/${editingItem._id}`, finalData);
            setShowSuccess('Menu item updated successfully!');
            fetchMenuItems();
            setShowEditModal(false);
            setEditingItem(null);
            resetForm();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating item:', err);
            alert('Failed to update menu item.');
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
                    <button 
                        onClick={() => { resetForm(); setShowAddModal(true); }} 
                        className="btn-premium" 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            padding: '12px 24px', 
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, var(--coffee-dark) 0%, #3b1f0e 100%)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 800,
                            boxShadow: '0 10px 20px rgba(59, 31, 14, 0.15)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 15px 30px rgba(59, 31, 14, 0.25)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(59, 31, 14, 0.15)';
                        }}
                    >
                        <div style={{ 
                            width: '28px', 
                            height: '28px', 
                            borderRadius: '50%', 
                            background: 'rgba(255,255,255,0.2)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <Plus size={18} />
                        </div>
                        <span style={{ letterSpacing: '0.5px' }}>ADD NEW ITEM</span>
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
