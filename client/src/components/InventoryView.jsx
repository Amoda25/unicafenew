import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit2, RotateCw, Trash2, AlertTriangle, ChevronLeft, ChevronRight, X, CheckCircle2, Clock, ShieldAlert, FileDown } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../assets/unicafe_logo_vintage.png';
import RestockModal from './RestockModal';

const InventoryView = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', category: 'Beverage', qty: '', unit: 'kg', expiry: '', supplier: '', minStockThreshold: '' });
    const [formErrors, setFormErrors] = useState({});
    const [inventoryData, setInventoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [suppliersList, setSuppliersList] = useState([]);
    
    // Restock state
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [restockItem, setRestockItem] = useState(null);

    // Delete confirmation state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Waste Log state
    const [wasteLogs, setWasteLogs] = useState([]);
    const [isWasteLoading, setIsWasteLoading] = useState(false);

    // Dispose confirmation state
    const [isDisposeModalOpen, setIsDisposeModalOpen] = useState(false);
    const [itemToDispose, setItemToDispose] = useState(null);
    const [disposeLoading, setDisposeLoading] = useState(false);
    
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
        fetchSuppliers();
        fetchWasteLogs();
    }, []);

    const fetchWasteLogs = async () => {
        setIsWasteLoading(true);
        try {
            const res = await axios.get('/api/inventory/waste-log');
            setWasteLogs(res.data);
        } catch (err) {
            console.error('Error fetching waste log:', err);
        } finally {
            setIsWasteLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await axios.get('/api/suppliers');
            setSuppliersList(response.data);
        } catch (err) {
            console.error('Error fetching suppliers:', err);
        }
    };

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

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                if (!value.trim()) error = 'Item name is required';
                else if (value.trim().length < 2) error = 'Name is too short';
                break;
            case 'qty':
                if (value === '') error = 'Quantity is required';
                else if (Number(value) < 0) error = 'Quantity cannot be negative';
                break;
            case 'expiry':
                if (!value) error = 'Expiry date is required';
                else {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selectedDate < today) error = 'Expiry date must be in the future';
                }
                break;
            case 'supplier':
                if (!value) error = 'Please select a supplier';
                break;
            case 'minStockThreshold':
                if (value === '') error = 'Minimum stock level is required';
                else if (Number(value) < 0) error = 'Cannot be negative';
                break;
            default:
                break;
        }
        return error;
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Real-time validation
        const error = validateField(name, value);
        setFormErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        // Validate all fields on submit
        const errors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) errors[key] = error;
        });

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
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
            setFormData({ name: '', category: 'Beverage', qty: '', unit: 'kg', expiry: '', supplier: '', minStockThreshold: '' });
            setFormErrors({});
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
            supplier: item.supplier || '',
            minStockThreshold: item.minStockThreshold || ''
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleDeleteItem = async () => {
        if (!itemToDelete) return;
        
        setDeleteLoading(true);
        try {
            await axios.delete(`/api/inventory/${itemToDelete._id}`);
            setShowSuccess(`${itemToDelete.name} deleted successfully!`);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            fetchInventory();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            console.error('Error deleting item:', err);
            alert('Failed to delete item.');
        } finally {
            setDeleteLoading(false);
        }
    };



    const handleDispose = async () => {
        if (!itemToDispose) return;

        setDisposeLoading(true);
        try {
            await axios.post('/api/inventory/dispose', { inventoryId: itemToDispose._id });
            setShowSuccess(`${itemToDispose.name} disposed successfully!`);
            setIsDisposeModalOpen(false);
            setItemToDispose(null);
            fetchInventory();
            fetchWasteLogs();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            console.error('Error disposing item:', err);
            alert('Failed to dispose item.');
        } finally {
            setDisposeLoading(false);
        }
    };

    const filteredData = inventoryData.filter(item => {
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const generateInventoryReport = () => {
        const doc = new jsPDF();
        
        // Add Header Branding
        doc.setFillColor(67, 40, 24); // #432818 (Mahogany Espresso)
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('UniCafé Inventory Report', 15, 25);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 33);
        doc.text(`Total Items: ${filteredData.length}`, 150, 33);

        // Define table columns
        const tableColumn = ["Item Name", "Category", "Quantity", "Unit", "Expiry Date", "Status"];
        const tableRows = [];

        filteredData.forEach(item => {
            const isExpired = item.expiry && new Date(item.expiry) < new Date();
            const status = isExpired ? 'EXPIRED' : 'GOOD';
            
            const inventoryRow = [
                item.name,
                item.category,
                item.qty,
                item.unit,
                item.expiry ? new Date(item.expiry).toLocaleDateString() : 'N/A',
                status
            ];
            tableRows.push(inventoryRow);
        });

        // Generate Table
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            headStyles: {
                fillColor: [127, 85, 57], // #7f5539
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [253, 250, 248] // Very light coffee
            },
            styles: {
                fontSize: 9,
                cellPadding: 4
            }
        });

        // Add Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount} - UniCafé Inventory Management System`, 105, 285, { align: 'center' });
        }

        doc.save(`UniCafe_Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.5s ease-out' }}>
            <style>{`
                .inventory-input {
                    width: 100%;
                    padding: 14px 20px;
                    border-radius: 12px;
                    border: 1px solid #f3e8e0;
                    background: #fdfaf8;
                    outline: none;
                    color: #432818;
                    font-size: 1rem;
                    font-weight: 500;
                    box-sizing: border-box;
                    transition: all 0.2s ease;
                    box-shadow: inset 0 2px 4px rgba(67, 40, 24, 0.02);
                }
                .inventory-input:focus {
                    border-color: #9c6644;
                    background: #ffffff;
                    box-shadow: 0 0 0 4px rgba(156, 102, 68, 0.1);
                }
                .error-border {
                    border-color: #ef4444 !important;
                }
                .error-text {
                    color: #ef4444;
                    font-size: 0.75rem;
                    font-weight: 700;
                    margin-top: 6px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    animation: slideDown 0.2s ease-out;
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .inventory-label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #7f5539;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .req-asterisk {
                    color: #b08968;
                    margin-left: 2px;
                }
            `}</style>
            
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#432818', marginBottom: '8px' }}>Inventory Management</h2>
                    <p style={{ color: '#9c6644', fontSize: '1rem', margin: 0 }}>Add, update, and track all cafeteria ingredients.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={generateInventoryReport}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px', 
                            background: 'white', color: '#7f5539', border: '2px solid #7f5539', 
                            padding: '10px 20px', borderRadius: '8px', fontSize: '0.95rem', 
                            fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#fdfaf8'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'white'; }}
                    >
                        <FileDown size={18} />
                        Generate Report
                    </button>
                    <button onClick={() => { 
                        setEditingId(null); 
                        setFormData({ name: '', category: 'Beverage', qty: '', unit: 'kg', expiry: '', supplier: '', minStockThreshold: '' }); 
                        setFormErrors({});
                        setIsModalOpen(true); 
                    }} style={{
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        background: 'linear-gradient(135deg, #7f5539 0%, #432818 100%)', color: 'white', border: 'none', 
                        padding: '10px 20px', borderRadius: '8px', fontSize: '0.95rem', 
                        fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(67,40,24,0.25)'
                    }}>
                        <Plus size={18} />
                        Add New Item
                    </button>
                </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '8px 20px',
                            background: activeCategory === cat ? 'linear-gradient(135deg, #7f5539 0%, #432818 100%)' : 'transparent',
                            color: activeCategory === cat ? 'white' : '#9c6644',
                            border: activeCategory === cat ? '1px solid transparent' : '1px solid #e5d5c5',
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
                                const today = new Date();
                                today.setHours(0,0,0,0);
                                const isExpired = item.expiry && new Date(item.expiry) < today;
                                
                                return (
                                    <tr key={item._id} style={{ borderBottom: idx < filteredData.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                         <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ color: '#1e293b', fontWeight: 700 }}>{item.name}</div>
                                                {isExpired && (
                                                    <span style={{ 
                                                        background: '#fee2e2', color: '#ef4444', padding: '2px 8px', 
                                                        borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800 
                                                    }}>EXPIRED</span>
                                                )}
                                            </div>
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
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                                {isExpired && (
                                                    <button 
                                                        onClick={() => { setItemToDispose(item); setIsDisposeModalOpen(true); }}
                                                        style={{ 
                                                            background: '#9f1239', color: 'white', border: 'none', 
                                                            padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', 
                                                            fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(159,18,57,0.2)',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={e=>e.currentTarget.style.background='#881337'}
                                                        onMouseOut={e=>e.currentTarget.style.background='#9f1239'}
                                                    >
                                                        Dispose
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => { setRestockItem(item); setIsRestockModalOpen(true); }}
                                                    style={{ 
                                                        background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex',
                                                        color: isLowStock ? '#ea580c' : '#cbd5e1', transition: 'all 0.2s'
                                                    }}
                                                    title="Restock Item"
                                                    onMouseOver={e=>e.currentTarget.style.color='#ea580c'} 
                                                    onMouseOut={e=>e.currentTarget.style.color=isLowStock ? '#ea580c' : '#cbd5e1'}
                                                >
                                                    <RotateCw size={16} />
                                                </button>
                                                <Edit2 size={16} style={{ cursor: 'pointer', color: '#cbd5e1' }} 
                                                    onClick={() => openEditModal(item)}
                                                    onMouseOver={e=>e.currentTarget.style.color='#3b82f6'} 
                                                    onMouseOut={e=>e.currentTarget.style.color='#cbd5e1'} 
                                                />
                                                <Trash2 size={16} style={{ cursor: 'pointer', color: '#cbd5e1' }} 
                                                    onClick={() => { setItemToDelete(item); setIsDeleteModalOpen(true); }}
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
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', borderRadius: '16px', width: '560px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        
                        {/* Header */}
                        <div style={{ 
                            background: '#5c3a21', /* dark brown header */
                            padding: '24px 32px',
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            position: 'relative'
                        }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', margin: '0 0 6px 0' }}>{editingId ? 'Edit Item' : 'Add New Item'}</h3>
                                <p style={{ color: '#fed7aa', fontSize: '0.9rem', margin: 0, opacity: 0.9 }}>Fill in the details to add to inventory</p>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} style={{ 
                                background: 'rgba(255,255,255,0.2)', 
                                border: 'none', 
                                cursor: 'pointer', 
                                color: 'white',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            ><X size={18} strokeWidth={2.5} /></button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '32px' }}>

                            
                            <div>
                                <label className="inventory-label">Item Name <span className="req-asterisk">*</span></label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleFormChange} 
                                    className={`inventory-input ${formErrors.name ? 'error-border' : ''}`} 
                                    placeholder="e.g. Whole Milk" 
                                />
                                {formErrors.name && <div className="error-text"><AlertTriangle size={12} /> {formErrors.name}</div>}
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="inventory-label">Category <span className="req-asterisk">*</span></label>
                                    <select name="category" value={formData.category} onChange={handleFormChange} className="inventory-input">
                                        {categories.filter(c => c !== 'All').map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="inventory-label">Expiry Date <span className="req-asterisk">*</span></label>
                                    <input 
                                        type="date" 
                                        name="expiry" 
                                        value={formData.expiry} 
                                        onChange={handleFormChange} 
                                        className={`inventory-input ${formErrors.expiry ? 'error-border' : ''}`}
                                    />
                                    {formErrors.expiry && (
                                        <div className="error-text">
                                            <AlertTriangle size={12} /> {formErrors.expiry}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="inventory-label">Quantity <span className="req-asterisk">*</span></label>
                                    <input 
                                        type="number" 
                                        name="qty" 
                                        value={formData.qty} 
                                        onChange={handleFormChange} 
                                        className={`inventory-input ${formErrors.qty ? 'error-border' : ''}`}
                                        placeholder="0" 
                                    />
                                    {formErrors.qty && <div className="error-text"><AlertTriangle size={12} /> {formErrors.qty}</div>}
                                </div>
                                <div>
                                    <label className="inventory-label">Unit <span className="req-asterisk">*</span></label>
                                    <select name="unit" value={formData.unit} onChange={handleFormChange} className="inventory-input">
                                        <option value="kg">kg</option>
                                        <option value="L">L</option>
                                        <option value="pcs">pcs</option>
                                        <option value="boxes">boxes</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="inventory-label">Supplier <span className="req-asterisk">*</span></label>
                                    <select 
                                        name="supplier" 
                                        value={formData.supplier} 
                                        onChange={handleFormChange} 
                                        className={`inventory-input ${formErrors.supplier ? 'error-border' : ''}`}
                                    >
                                        <option value="">— Select supplier —</option>
                                        {suppliersList.map(sup => (
                                            <option key={sup._id} value={sup.name}>{sup.name}</option>
                                        ))}
                                    </select>
                                    {formErrors.supplier && <div className="error-text"><AlertTriangle size={12} /> {formErrors.supplier}</div>}
                                </div>
                                <div>
                                    <label className="inventory-label">Min Stock Level <span className="req-asterisk">*</span></label>
                                    <input 
                                        type="number" 
                                        name="minStockThreshold" 
                                        value={formData.minStockThreshold} 
                                        onChange={handleFormChange} 
                                        className={`inventory-input ${formErrors.minStockThreshold ? 'error-border' : ''}`} 
                                        placeholder="e.g. 10" 
                                    />
                                    {formErrors.minStockThreshold && <div className="error-text"><AlertTriangle size={12} /> {formErrors.minStockThreshold}</div>}
                                </div>
                            </div>
                            
                            <hr style={{ border: 'none', borderTop: '1px solid #f3e8e0', margin: '10px 0 0 0' }} />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '8px' }}>
                                <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} style={{ 
                                    padding: '12px 24px', 
                                    borderRadius: '10px', 
                                    border: '1px solid #e5d5c5', 
                                    background: 'white', 
                                    color: '#7f5539', 
                                    fontWeight: 700, 
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}>Cancel</button>
                                <button type="submit" style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px', 
                                    borderRadius: '10px', 
                                    border: 'none', 
                                    background: '#5c3a21', 
                                    color: 'white', 
                                    fontWeight: 700, 
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(92, 58, 33, 0.2)',
                                    transition: 'transform 0.2s, boxShadow 0.2s'
                                }}>
                                    <span style={{ fontSize: '1.2rem', lineHeight: '0' }}>+</span>
                                    {editingId ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showSuccess && (
                <div style={{ 
                    position: 'fixed', bottom: '40px', right: '40px', 
                    background: (showSuccess.toLowerCase().includes('disposed') || showSuccess.toLowerCase().includes('deleted')) ? '#e11d48' : '#10b981', 
                    padding: '16px 25px', borderRadius: '16px', color: 'white', fontWeight: 700, zIndex: 3000, 
                    boxShadow: (showSuccess.toLowerCase().includes('disposed') || showSuccess.toLowerCase().includes('deleted')) ? '0 10px 30px rgba(225,29,72,0.3)' : '0 10px 30px rgba(16, 185, 129, 0.3)', 
                    display: 'flex', alignItems: 'center', gap: '12px' 
                }}>
                    <CheckCircle2 size={20} />
                    {showSuccess}
                </div>
            )}
            {/* Restock Modal */}
            {/* Restock Modal */}
            <RestockModal 
                isOpen={isRestockModalOpen} 
                onClose={() => { setIsRestockModalOpen(false); setRestockItem(null); }}
                item={restockItem}
                onSuccess={(msg) => {
                    setShowSuccess(msg);
                    fetchInventory();
                    setTimeout(() => setShowSuccess(''), 3000);
                }}
            />
            
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && itemToDelete && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', borderRadius: '16px', width: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
                        <div style={{ background: '#7c2d12', padding: '24px 32px', color: 'white', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Trash2 size={24} />
                                        Delete Item  
                                    </h3>
                                </div>
                                <button onClick={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }} style={{ 
                                    background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white',
                                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}><X size={18} /></button>
                            </div>
                        </div>
                        <div style={{ padding: '32px', textAlign: 'center' }}>
                            <div style={{ 
                                width: '64px', height: '64px', borderRadius: '50%', background: '#fff1f2', 
                                color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                margin: '0 auto 20px auto' 
                            }}>
                                <AlertTriangle size={32} />
                            </div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: '0 0 10px 0' }}>Are you sure?</h4>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                                You are about to delete <strong style={{ color: '#1e293b' }}>{itemToDelete.name}</strong>. 
                                This action cannot be undone.
                            </p>
                        </div>
                        <div style={{ padding: '0 32px 32px 32px', display: 'flex', gap: '12px' }}>
                            <button 
                                onClick={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
                                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}
                            >Cancel</button>
                            <button 
                                onClick={handleDeleteItem}
                                disabled={deleteLoading}
                                style={{ 
                                    flex: 1, padding: '12px', borderRadius: '12px', border: 'none', 
                                    background: '#e11d48', color: 'white', fontWeight: 700, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                {deleteLoading ? <RotateCw size={16} className="spin" /> : <Trash2 size={16} />}
                                Delete Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Waste Log Section */}
            <div style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #5c3a21 0%, #7f1d1d 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(92, 58, 33, 0.2)' }}>
                            <Trash2 size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#5c3a21' }}>Waste Log</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Recently disposed expired items are tracked here</p>
                        </div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #5c3a21 0%, #7f1d1d 100%)', color: 'white', padding: '6px 14px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 800, boxShadow: '0 4px 12px rgba(92, 58, 33, 0.15)' }}>
                        {wasteLogs.length} disposed
                    </div>
                </div>

                <div className="glass" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                <th style={{ padding: '16px 20px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Item Name</th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Disposed On</th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Qty</th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Category</th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isWasteLoading ? (
                                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Updating waste log...</td></tr>
                            ) : wasteLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '60px 40px', textAlign: 'center' }}>
                                        <div style={{ color: '#cbd5e1', marginBottom: '12px' }}><Trash2 size={40} style={{ opacity: 0.5 }} /></div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>No disposed items yet.</div>
                                    </td>
                                </tr>
                            ) : (
                                wasteLogs.map((log, idx) => (
                                    <tr key={log._id} style={{ borderBottom: idx < wasteLogs.length - 1 ? '1px solid #f8fafc' : 'none', borderLeft: '4px solid #9f1239' }}>
                                        <td style={{ padding: '16px 20px', fontWeight: 700, color: '#1e293b' }}>{log.name}</td>
                                        <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.85rem' }}>{new Date(log.disposedAt).toLocaleString()}</td>
                                        <td style={{ padding: '16px 20px', fontWeight: 800, color: '#9f1239' }}>{log.qty} <span style={{ color: '#94a3b8', fontWeight: 600 }}>{log.unit}</span></td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <span style={{ padding: '4px 10px', background: '#fff1f2', color: '#9f1239', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>{log.category}</span>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <span style={{ color: '#9f1239', fontWeight: 700, fontSize: '0.81rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9f1239' }} />
                                                {log.reason}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dispose Confirmation Modal */}
            {isDisposeModalOpen && itemToDispose && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1250, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', borderRadius: '16px', width: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(135deg, #5c3a21 0%, #7f1d1d 100%)', padding: '24px 32px', color: 'white', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <AlertTriangle size={24} />
                                        Dispose Expired Item
                                    </h3>
                                </div>
                                <button onClick={() => { setIsDisposeModalOpen(false); setItemToDispose(null); }} style={{ 
                                    background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white',
                                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}><X size={18} /></button>
                            </div>
                        </div>
                        <div style={{ padding: '32px', textAlign: 'center' }}>
                            <div style={{ 
                                width: '64px', height: '64px', borderRadius: '50%', background: '#fff1f1', 
                                color: '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                margin: '0 auto 20px auto' 
                            }}>
                                <Clock size={32} />
                            </div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: '0 0 10px 0' }}>Confirm Disposal</h4>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                                You are about to dispose of <strong style={{ color: '#1e293b' }}>{itemToDispose.name}</strong> ({itemToDispose.qty} {itemToDispose.unit}). 
                                This will remove it from inventory and log it as waste.
                            </p>
                        </div>
                        <div style={{ padding: '0 32px 32px 32px', display: 'flex', gap: '12px' }}>
                            <button 
                                onClick={() => { setIsDisposeModalOpen(false); setItemToDispose(null); }}
                                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}
                            >Cancel</button>
                            <button 
                                onClick={handleDispose}
                                disabled={disposeLoading}
                                style={{ 
                                    flex: 1, padding: '12px', borderRadius: '12px', border: 'none', 
                                    background: '#e11d48', color: 'white', fontWeight: 700, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                {disposeLoading ? <RotateCw size={16} className="spin" /> : <ShieldAlert size={16} />}
                                Confirm Dispose
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .spin { animation: spin 1s linear infinite; } 
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default InventoryView;
