import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit2, RotateCw, Trash2, AlertTriangle, ChevronLeft, ChevronRight, X, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const InventoryView = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', category: 'Beverage', qty: '', unit: 'kg', expiry: '', supplier: '' });
    const [expiryError, setExpiryError] = useState('');
    const [qtyError, setQtyError] = useState('');
    const [inventoryData, setInventoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const categories = ['All', 'Beverage', 'Dairy', 'Pantry', 'Meat', 'Vegetables', 'Other'];
    
    const categoryStyles = {
        'Beverage': { bg: '#eff6ff', text: '#3b82f6' },
        'Dairy': { bg: '#faf5ff', text: '#a855f7' },
        'Pantry': { bg: '#fff7ed', text: '#f97316' },
        'Meat': { bg: '#fef2f2', text: '#ef4444' },
        'Vegetables': { bg: '#f0fdf4', text: '#10b981' },
        'Other': { bg: '#f1f5f9', text: '#64748b' }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/inventory');
            setInventoryData(response.data);
        } catch (err) {
            console.error('Error fetching inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        if (name === 'expiry' && value) {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                setExpiryError('Expiry date must be in the future');
            } else {
                setExpiryError('');
            }
        } else if (name === 'expiry') {
            setExpiryError('');
        }

        if (name === 'qty') {
            if (Number(value) < 0) {
                setQtyError('Quantity cannot be negative');
            } else {
                setQtyError('');
            }
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        if (expiryError || qtyError) {
            alert('Please correct the errors before saving.');
            return;
        }

        try {
            if (editingId) {
                await axios.put(`/api/inventory/${editingId}`, formData);
                setShowSuccess('Item updated successfully!');
            } else {
                await axios.post('/api/inventory', formData);
                setShowSuccess('Item added successfully!');
            }
            
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ name: '', category: 'Beverage', qty: '', unit: 'kg', expiry: '', supplier: '' });
            fetchInventory();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving item:', err);
            alert('Failed to save item. Please try again.');
        }
    };

    const openEditModal = (item) => {
        setEditingId(item._id);
        setFormData({
            name: item.name,
            category: item.category,
            qty: item.qty,
            unit: item.unit,
            expiry: item.expiry || '',
            supplier: item.supplier || ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        
        try {
            await axios.delete(`/api/inventory/${id}`);
            setShowSuccess('Item deleted successfully!');
            fetchInventory();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            console.error('Error deleting item:', err);
            alert('Failed to delete item.');
        }
    };

    const filteredData = inventoryData.filter(item => {
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Inventory Management</h2>
                    <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>Add, update, and track all cafeteria ingredients.</p>
                </div>
                <button onClick={() => { setEditingId(null); setFormData({ name: '', category: 'Beverage', qty: '', unit: 'kg', expiry: '', supplier: '' }); setIsModalOpen(true); }} style={{
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    background: 'linear-gradient(135deg, #FFB800 0%, #ea580c 100%)', color: 'white', border: 'none', 
                    padding: '10px 20px', borderRadius: '8px', fontSize: '0.95rem', 
                    fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(234,88,12,0.2)'
                }}>
                    <Plus size={18} />
                    Add New Item
                </button>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '8px 20px',
                            background: activeCategory === cat ? 'linear-gradient(135deg, #FFB800 0%, #ea580c 100%)' : 'transparent',
                            color: activeCategory === cat ? 'white' : '#64748b',
                            border: activeCategory === cat ? 'none' : '1px solid #e2e8f0',
                            borderRadius: '99px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Main Table Container */}
            <div className="glass" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', borderRadius: '16px', background: 'white' }}>
                
                {/* Table Toolbar */}
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ position: 'relative', width: '350px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search items or suppliers..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                width: '100%', padding: '10px 16px 10px 44px',
                                borderRadius: '8px', border: '1px solid #e2e8f0', 
                                background: '#ffffff', color: '#1e293b', fontSize: '0.9rem', outline: 'none'
                            }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ color: '#475569', fontSize: '0.875rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '20px', width: '25%' }}>Item Name</th>
                                <th style={{ padding: '20px', width: '15%' }}>Category</th>
                                <th style={{ padding: '20px', width: '15%' }}>Quantity</th>
                                <th style={{ padding: '20px', width: '15%' }}>Expiry Date</th>
                                <th style={{ padding: '20px', width: '20%' }}>Supplier</th>
                                <th style={{ padding: '20px', width: '10%', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading inventory...</td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No items found.</td>
                                </tr>
                            ) : filteredData.map((item, idx) => {
                                const style = categoryStyles[item.category] || categoryStyles['Other'];
                                const isLowStock = item.qty <= (item.minStockThreshold || 10);
                                
                                return (
                                    <tr key={item._id} style={{ borderBottom: idx < filteredData.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ color: '#1e293b', fontWeight: 700, marginBottom: '6px' }}>{item.name}</div>
                                            <span style={{ 
                                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                padding: '4px 8px', background: '#f0fdf4', color: '#10b981', 
                                                borderRadius: '99px', fontSize: '0.7rem', fontWeight: 800
                                            }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
                                                {item.status || 'Good'}
                                            </span>
                                        </td>
                                        
                                        <td style={{ padding: '20px' }}>
                                            <span style={{ 
                                                padding: '6px 12px', background: style.bg, color: style.text, 
                                                borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800
                                            }}>
                                                {item.category}
                                            </span>
                                        </td>

                                        <td style={{ padding: '20px' }}>
                                            <div style={{ 
                                                color: isLowStock ? '#d97706' : '#1e293b', 
                                                fontWeight: 800, fontSize: '0.95rem', marginBottom: isLowStock ? '6px' : '0' 
                                            }}>
                                                {item.qty} <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>{item.unit}</span>
                                            </div>
                                            {isLowStock && (
                                                <span style={{ 
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    padding: '4px 8px', border: '1px solid #fde68a', background: '#fffbeb', 
                                                    color: '#d97706', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800
                                                }}>
                                                    <AlertTriangle size={10} strokeWidth={3} />
                                                    LOW STOCK
                                                </span>
                                            )}
                                        </td>

                                        <td style={{ padding: '20px', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>
                                            {item.expiry || 'N/A'}
                                        </td>

                                        <td style={{ padding: '20px', color: '#475569', fontSize: '0.9rem' }}>
                                            {item.supplier || 'Unassigned'}
                                        </td>

                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                                <Edit2 size={16} style={{ cursor: 'pointer', color: '#cbd5e1' }} 
                                                    onClick={() => openEditModal(item)}
                                                    onMouseOver={e=>e.currentTarget.style.color='#3b82f6'} 
                                                    onMouseOut={e=>e.currentTarget.style.color='#cbd5e1'} 
                                                />
                                                <Trash2 size={16} style={{ cursor: 'pointer', color: '#cbd5e1' }} 
                                                    onClick={() => handleDeleteItem(item._id)}
                                                    onMouseOver={e=>e.currentTarget.style.color='#ef4444'} 
                                                    onMouseOut={e=>e.currentTarget.style.color='#cbd5e1'} 
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Static for now) */}
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
                        Showing <span style={{ fontWeight: 800, color: '#1e293b' }}>{filteredData.length}</span> items
                    </div>
                </div>

            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{editingId ? 'Edit Item' : 'Add New Item'}</h3>
                            <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Item Name</label>
                                <input required type="text" name="name" value={formData.name} onChange={handleFormChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b' }} placeholder="e.g. Vanilla Extract" />
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Category</label>
                                    <select name="category" value={formData.category} onChange={handleFormChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b', background: 'white' }}>
                                        {categories.filter(c => c !== 'All').map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ flex: 2 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Quantity</label>
                                        <input 
                                            required 
                                            type="number" 
                                            name="qty" 
                                            min="0"
                                            value={formData.qty} 
                                            onChange={handleFormChange} 
                                            style={{ 
                                                width: '100%', 
                                                padding: '10px 12px', 
                                                borderRadius: '8px', 
                                                border: `1px solid ${qtyError ? '#ef4444' : '#e2e8f0'}`, 
                                                outline: 'none', 
                                                color: '#1e293b' 
                                            }} 
                                            placeholder="0" 
                                        />
                                        {qtyError && <div style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '4px', fontWeight: 600 }}>{qtyError}</div>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Unit</label>
                                        <select name="unit" value={formData.unit} onChange={handleFormChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b', background: 'white' }}>
                                            <option value="kg">kg</option>
                                            <option value="L">L</option>
                                            <option value="pcs">pcs</option>
                                            <option value="boxes">boxes</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Expiry Date</label>
                                    <input 
                                        type="date" 
                                        name="expiry" 
                                        min={new Date().toISOString().split('T')[0]}
                                        value={formData.expiry} 
                                        onChange={handleFormChange} 
                                        style={{ 
                                            width: '100%', 
                                            padding: '10px 12px', 
                                            borderRadius: '8px', 
                                            border: `1px solid ${expiryError ? '#ef4444' : '#e2e8f0'}`, 
                                            outline: 'none', 
                                            color: '#1e293b',
                                            transition: 'border-color 0.2s'
                                        }} 
                                    />
                                    {expiryError && (
                                        <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <AlertTriangle size={12} /> {expiryError}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Supplier</label>
                                    <input type="text" name="supplier" value={formData.supplier} onChange={handleFormChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b' }} placeholder="e.g. Global Roasters" />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'transparent', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #FFB800 0%, #ea580c 100%)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>{editingId ? 'Update Item' : 'Save Item'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showSuccess && (
                <div style={{ position: 'fixed', bottom: '40px', right: '40px', background: '#10b981', padding: '16px 25px', borderRadius: '16px', color: 'white', fontWeight: 700, zIndex: 3000, boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CheckCircle2 size={20} />
                    {showSuccess}
                </div>
            )}
        </div>
    );
};

export default InventoryView;
