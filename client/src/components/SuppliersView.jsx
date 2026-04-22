import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Building2, User, Mail, Phone, Edit, Package, Trash2, Users, UserCheck, UserX, ShoppingBag, X, MapPin, CheckCircle2, FileDown } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/unicafe_logo_vintage.png';


const SuppliersView = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showOrdersModal, setShowOrdersModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [supplierItems, setSupplierItems] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState('');

    // Validation state
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');

    // Delete Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    
    // Report dropdown state
    const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);
    const reportDropdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (reportDropdownRef.current && !reportDropdownRef.current.contains(event.target)) {
                setIsReportDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [newSupplier, setNewSupplier] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        status: 'ACTIVE'
    });


    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const response = await axios.get('/api/suppliers');
            setSuppliers(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching suppliers:', err);
            setLoading(false);
        }
    };

    const handleAddSupplier = async (e) => {
        e.preventDefault();
        
        // Reset errors
        setEmailError('');
        setPhoneError('');

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newSupplier.email)) {
            setEmailError('Please enter a valid email address (e.g., sunil@ceylon.com)');
            return;
        }

        // Phone validation (Flexible digits, allows +)
        const phoneClean = newSupplier.phone.replace(/[\s-]/g, '');
        const phoneRegex = /^\+?\d{9,15}$/;
        if (!phoneRegex.test(phoneClean)) {
            setPhoneError('Please enter a valid phone number (at least 9 digits)');
            return;
        }

        try {
            if (isEditing) {
                await axios.put(`/api/suppliers/${editId}`, newSupplier);
                setShowSuccess(`${newSupplier.name} updated successfully!`);
            } else {
                await axios.post('/api/suppliers', newSupplier);
                setShowSuccess(`${newSupplier.name} registered successfully!`);
            }
            setShowModal(false);
            resetForm();
            fetchSuppliers();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving supplier:', err);
            alert('Failed to save supplier: ' + (err.response?.data?.error || err.message));
        }
    };

    const resetForm = () => {
        setNewSupplier({
            name: '',
            contactPerson: '',
            email: '',
            phone: '',
            address: '',
            status: 'ACTIVE'
        });
        setIsEditing(false);
        setEditId(null);
        setEmailError('');
        setPhoneError('');
    };

    const handleEditClick = (supplier) => {
        setNewSupplier({
            name: supplier.name,
            contactPerson: supplier.contactPerson,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address || '',
            status: supplier.status
        });
        setEditId(supplier._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleOrdersClick = async (supplier) => {
        setSelectedSupplier(supplier);
        setShowOrdersModal(true);
        setItemsLoading(true);
        try {
            const response = await axios.get(`/api/inventory/supplier/${encodeURIComponent(supplier.name)}`);
            setSupplierItems(response.data);
            setItemsLoading(false);
        } catch (err) {
            console.error('Error fetching supplier items:', err);
            setItemsLoading(false);
        }
    };


    const handleDeleteSupplier = (supplier) => {
        setSupplierToDelete(supplier);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!supplierToDelete) return;
        setDeleteLoading(true);
        try {
            await axios.delete(`/api/suppliers/${supplierToDelete._id}`);
            setShowSuccess(`Supplier ${supplierToDelete.name} deleted successfully!`);
            setIsDeleteModalOpen(false);
            setSupplierToDelete(null);
            fetchSuppliers();
            setTimeout(() => {
                setShowSuccess('');
                window.location.href = '/ims';
            }, 2000);
        } catch (err) {
            console.error('Error deleting supplier:', err);
            alert('Failed to delete supplier: ' + (err.response?.data?.error || err.message));
        } finally {
            setDeleteLoading(false);
        }
    };

    const filteredSuppliers = suppliers.filter(supplier => {
        const matchesFilter = activeFilter === 'All' || 
                            (activeFilter === 'Active' && supplier.status === 'ACTIVE') || 
                            (activeFilter === 'Inactive' && supplier.status === 'INACTIVE');
        
        const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
                            
        return matchesFilter && matchesSearch;
    });

    const generateSuppliersReport = async (reportType = 'Full Registry Report') => {
        const doc = new jsPDF();
        let reportData = [...suppliers];
        let title = 'UniCafé Supplier Registry';
        let fileName = 'UniCafe_Suppliers_Report';
        let tableColumn = ["Supplier Name", "Contact Person", "Email", "Phone", "Status"];

        if (reportType === 'Active Suppliers Report') {
            reportData = suppliers.filter(s => s.status === 'ACTIVE');
            title = 'UniCafé Active Suppliers';
            fileName = 'UniCafe_Active_Suppliers';
        } else if (reportType === 'Inactive Suppliers Report') {
            reportData = suppliers.filter(s => s.status === 'INACTIVE');
            title = 'UniCafé Inactive Suppliers';
            fileName = 'UniCafe_Inactive_Suppliers';
        } else if (reportType === 'Supplier Contact List') {
            reportData = [...suppliers];
            title = 'UniCafé Supplier Contact List';
            fileName = 'UniCafe_Supplier_Contacts';
            tableColumn = ["Supplier Name", "Contact Person", "Email", "Phone"];
        } else if (reportType === 'Supplied Items Summary') {
            try {
                const invRes = await axios.get('/api/inventory');
                const inventory = invRes.data;
                
                title = 'UniCafé Supplied Items Summary';
                fileName = 'UniCafe_Supplied_Items';
                tableColumn = ["Supplier", "Item", "Category", "Stock", "Unit"];
                
                const tableRows = [];
                inventory.forEach(item => {
                    if (item.supplier) {
                        tableRows.push([
                            item.supplier,
                            item.name,
                            item.category,
                            item.qty,
                            item.unit
                        ]);
                    }
                });
                
                finalizePdf(doc, title, fileName, tableColumn, tableRows);
                return;
            } catch (err) {
                console.error('Error generating supplied items report:', err);
                return;
            }
        }

        const tableRows = reportData.map(supplier => {
            if (reportType === 'Supplier Contact List') {
                return [supplier.name, supplier.contactPerson, supplier.email, supplier.phone];
            }
            return [supplier.name, supplier.contactPerson, supplier.email, supplier.phone, supplier.status];
        });

        finalizePdf(doc, title, fileName, tableColumn, tableRows);
    };

    const finalizePdf = (doc, title, fileName, tableColumn, tableRows) => {
        // Add Header Branding
        doc.setFillColor(67, 40, 24); // #432818
        doc.rect(0, 0, 210, 40, 'F');
        
        try {
            // Draw a white circular badge for the logo
            doc.setFillColor(255, 255, 255);
            doc.circle(27, 20, 15, 'F');
            doc.addImage(logo, 'PNG', 15, 8, 24, 24);
        } catch (e) {
            console.warn('Logo addition failed:', e);
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('UniCafé', 45, 20);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(title, 45, 30);
        
        doc.setFontSize(9);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 150, 20);
        doc.text(`Total Records: ${tableRows.length}`, 150, 30);

        try {
            autoTable(doc, {
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
                    fillColor: [253, 250, 248]
                },
                styles: {
                    fontSize: 9,
                    cellPadding: 4
                }
            });

            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Page ${i} of ${pageCount} - UniCafé Inventory Management System`, 105, 285, { align: 'center' });
            }

            doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please check the console for details.');
        }
    };

    const stats = [
        { label: 'TOTAL SUPPLIERS', value: suppliers.length.toString(), icon: Users, color: '#3b82f6', bg: '#eff6ff' },
        { label: 'ACTIVE SUPPLIERS', value: suppliers.filter(s => s.status === 'ACTIVE').length.toString(), icon: UserCheck, color: '#10b981', bg: '#f0fdf4' },
        { label: 'INACTIVE SUPPLIERS', value: suppliers.filter(s => s.status === 'INACTIVE').length.toString(), icon: UserX, color: '#ef4444', bg: '#fef2f2' }
    ];


    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.5s ease-out' }}>
            
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Supplier Management</h2>
                    <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>Manage cafeteria food and ingredient suppliers.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ position: 'relative' }} ref={reportDropdownRef}>
                    <button 
                        onClick={() => setIsReportDropdownOpen(!isReportDropdownOpen)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px', 
                            background: 'white', color: '#7f5539', border: '2px solid #7f5539', 
                            padding: '10px 20px', borderRadius: '8px', fontSize: '0.95rem', 
                            fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#f5ebe0'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'white'; }}
                    >
                        <FileDown size={18} />
                        Generate Report
                    </button>
                    
                    {isReportDropdownOpen && (
                        <div style={{ 
                            position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                            background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                            border: '1px solid #f1f5f9', zIndex: 100, width: '280px', overflow: 'hidden',
                            animation: 'slideDown 0.2s ease-out'
                        }}>
                            {[
                                'Full Registry Report',
                                'Active Suppliers Report',
                                'Inactive Suppliers Report',
                                'Supplier Contact List',
                                'Supplied Items Summary'
                            ].map((report, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => {
                                        generateSuppliersReport(report);
                                        setIsReportDropdownOpen(false);
                                    }}
                                    style={{
                                        width: '100%', padding: '12px 20px', textAlign: 'left',
                                        background: 'none', border: 'none', color: '#1e293b',
                                        fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        borderBottom: idx === 4 ? 'none' : '1px solid #f1f5f9',
                                        display: 'block'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = '#f5ebe0'; e.currentTarget.style.color = '#432818'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#1e293b'; }}
                                >
                                    {report}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                    <button 
                        onClick={() => { resetForm(); setShowModal(true); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px', 
                            background: 'linear-gradient(135deg, #7f5539 0%, #5c3a21 100%)', color: 'white', border: 'none', 
                            padding: '10px 20px', borderRadius: '8px', fontSize: '0.95rem', 
                            fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(92,58,33,0.25)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => { 
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(92,58,33,0.35)';
                        }}
                        onMouseOut={(e) => { 
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(92,58,33,0.25)';
                        }}
                    >
                        <Plus size={18} />
                        Add Supplier
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="glass" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '4px' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '8px' }}>
                <div style={{ position: 'relative', width: '350px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                        type="text" 
                        placeholder="Search suppliers..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            width: '100%', padding: '10px 16px 10px 44px',
                            borderRadius: '12px', border: '1px solid #e2e8f0', 
                            background: '#ffffff', color: '#1e293b', fontSize: '0.95rem', outline: 'none'
                        }}
                    />

                </div>
                <div style={{ display: 'flex', gap: '4px', background: 'white', border: '1px solid #e2e8f0', padding: '4px', borderRadius: '12px' }}>
                    {['All', 'Active', 'Inactive'].map(filter => (
                        <button 
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            style={{
                                padding: '8px 24px',
                                background: activeFilter === filter ? 'linear-gradient(135deg, #7f5539 0%, #5c3a21 100%)' : 'transparent',
                                color: activeFilter === filter ? 'white' : '#9c6644',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Suppliers Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px', marginTop: '8px' }}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        Loading suppliers...
                    </div>
                ) : filteredSuppliers.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748b', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                        <Users size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <p>No suppliers found matching your search.</p>
                    </div>
                ) : filteredSuppliers.map(supplier => (
                    <div key={supplier._id} className="glass" style={{ padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {/* Card Header */}
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>{supplier.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                    <span style={{ 
                                        padding: '4px 8px', borderRadius: '6px', 
                                        background: supplier.status === 'ACTIVE' ? '#f0fdf4' : '#f1f5f9', 
                                        color: supplier.status === 'ACTIVE' ? '#10b981' : '#64748b',
                                        display: 'flex', alignItems: 'center', gap: '4px'
                                    }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                                        {supplier.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
                                    {supplier.contactPerson ? supplier.contactPerson.charAt(0) : 'S'}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: '2px', letterSpacing: '0.05em' }}>CONTACT</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{supplier.contactPerson}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Mail size={14} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: '2px', letterSpacing: '0.05em' }}>EMAIL</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#3b82f6', cursor: 'pointer' }}>{supplier.email}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Phone size={14} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: '2px', letterSpacing: '0.05em' }}>PHONE</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{supplier.phone}</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
                            <button 
                                onClick={() => handleEditClick(supplier)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                                <Edit size={16} /> Edit
                            </button>
                            <button 
                                onClick={() => handleOrdersClick(supplier)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: '#f0fdf4', color: '#10b981', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                                <Package size={16} /> Items
                            </button>

                            <button 
                                onClick={() => handleDeleteSupplier(supplier)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                                <Trash2 size={16} /> Delete
                            </button>

                        </div>

                    </div>
                ))}
            </div>

            {/* Add Supplier Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', borderRadius: '16px', width: '560px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                        {/* Dark Brown Header */}
                        <div style={{
                            background: '#5c3a21',
                            padding: '24px 32px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                        }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', margin: '0 0 6px 0' }}>
                                    {isEditing ? 'Edit Supplier' : 'Add New Supplier'}
                                </h3>
                                <p style={{ color: '#fed7aa', fontSize: '0.9rem', margin: 0, opacity: 0.9 }}>
                                    {isEditing ? 'Modify the supplier details below.' : 'Fill in the details to register a new supplier.'}
                                </p>
                            </div>
                            <button onClick={() => { setShowModal(false); resetForm(); }} style={{
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
                                fontSize: '1rem',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            >✕</button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleAddSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '32px' }}>
                            <style>{`
                                .sup-input {
                                    width: 100%;
                                    padding: 12px 16px;
                                    border-radius: 10px;
                                    border: 1px solid #f3e8e0;
                                    background: #fdfaf8;
                                    outline: none;
                                    color: #432818;
                                    font-size: 0.95rem;
                                    font-weight: 500;
                                    box-sizing: border-box;
                                    transition: border-color 0.2s;
                                    font-family: inherit;
                                }
                                .sup-input:focus {
                                    border-color: #9c6644;
                                }
                                .sup-label {
                                    display: block;
                                    margin-bottom: 8px;
                                    font-size: 0.75rem;
                                    font-weight: 800;
                                    color: #7f5539;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                }
                                .sup-input-icon {
                                    position: relative;
                                }
                                .sup-input-icon svg {
                                    position: absolute;
                                    left: 13px;
                                    top: 50%;
                                    transform: translateY(-50%);
                                    color: #b08968;
                                }
                                .sup-input-icon input,
                                .sup-input-icon textarea {
                                    padding-left: 40px !important;
                                }
                                .sup-input-icon-top svg {
                                    position: absolute;
                                    left: 13px;
                                    top: 14px;
                                    color: #b08968;
                                }
                            `}</style>

                            {/* Row 1 */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="sup-label">Company Name <span style={{ color: '#b08968' }}>*</span></label>
                                    <div className="sup-input-icon" style={{ position: 'relative' }}>
                                        <Building2 size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#b08968' }} />
                                        <input required type="text" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} placeholder="e.g. Ceylon Roasters" className="sup-input" style={{ paddingLeft: '40px' }} />
                                    </div>
                                </div>
                                <div>
                                    <label className="sup-label">Contact Person <span style={{ color: '#b08968' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#b08968' }} />
                                        <input required type="text" value={newSupplier.contactPerson} onChange={e => setNewSupplier({...newSupplier, contactPerson: e.target.value})} placeholder="e.g. Sunil Perera" className="sup-input" style={{ paddingLeft: '40px' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="sup-label">Email Address <span style={{ color: '#b08968' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#b08968' }} />
                                        <input 
                                            required type="email" 
                                            value={newSupplier.email} 
                                            onChange={e => { 
                                                const val = e.target.value;
                                                setNewSupplier({...newSupplier, email: val}); 
                                                if (!val) setEmailError('');
                                                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) setEmailError('Invalid email format');
                                                else setEmailError(''); 
                                            }} 
                                            placeholder="sunil@ceylon.com" 
                                            className="sup-input" 
                                            style={{ paddingLeft: '40px', borderColor: emailError ? '#ef4444' : '#f3e8e0' }} 
                                        />
                                    </div>
                                    {emailError && <div style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 700, marginTop: '4px' }}>{emailError}</div>}
                                </div>
                                <div>
                                    <label className="sup-label">Phone Number <span style={{ color: '#b08968' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#b08968' }} />
                                        <input 
                                            required type="tel" 
                                            value={newSupplier.phone} 
                                            onChange={e => { 
                                                const val = e.target.value;
                                                setNewSupplier({...newSupplier, phone: val}); 
                                                const phoneClean = val.replace(/[\s-]/g, '');
                                                if (!val) setPhoneError('');
                                                else if (!/^\+?\d{9,15}$/.test(phoneClean)) setPhoneError('Invalid phone format (min 9 digits)');
                                                else setPhoneError(''); 
                                            }} 
                                            placeholder="+94 77 123 4567" 
                                            className="sup-input" 
                                            style={{ paddingLeft: '40px', borderColor: phoneError ? '#ef4444' : '#f3e8e0' }} 
                                        />
                                    </div>
                                    {phoneError && <div style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 700, marginTop: '4px' }}>{phoneError}</div>}
                                </div>
                            </div>

                            {/* Office Address */}
                            <div>
                                <label className="sup-label">Office Address</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={16} style={{ position: 'absolute', left: '13px', top: '14px', color: '#b08968' }} />
                                    <textarea value={newSupplier.address} onChange={e => setNewSupplier({...newSupplier, address: e.target.value})} placeholder="123 Galle Road, Colombo" rows={3} className="sup-input" style={{ paddingLeft: '40px', resize: 'vertical' }} />
                                </div>
                            </div>

                            {/* Status Toggle */}
                            <div>
                                <label className="sup-label">Supplier Status</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <button type="button" onClick={() => setNewSupplier({...newSupplier, status: 'ACTIVE'})}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: newSupplier.status === 'ACTIVE' ? 'none' : '1px solid #f3e8e0',
                                            background: newSupplier.status === 'ACTIVE' ? 'linear-gradient(135deg, #34d399, #10b981)' : '#fdfaf8',
                                            color: newSupplier.status === 'ACTIVE' ? 'white' : '#9c6644',
                                            fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s'
                                        }}>Active</button>
                                    <button type="button" onClick={() => setNewSupplier({...newSupplier, status: 'INACTIVE'})}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: newSupplier.status === 'INACTIVE' ? 'none' : '1px solid #f3e8e0',
                                            background: newSupplier.status === 'INACTIVE' ? '#ef4444' : '#fdfaf8',
                                            color: newSupplier.status === 'INACTIVE' ? 'white' : '#9c6644',
                                            fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s'
                                        }}>Inactive</button>
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid #f3e8e0', margin: '4px 0 0 0' }} />

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{
                                    padding: '12px 24px', borderRadius: '10px', border: '1px solid #e5d5c5',
                                    background: 'white', color: '#7f5539', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer'
                                }}>Cancel</button>
                                <button type="submit" style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '12px 28px', borderRadius: '10px', border: 'none',
                                    background: '#5c3a21', color: 'white', fontWeight: 700,
                                    fontSize: '0.95rem', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(92,58,33,0.25)'
                                }}>
                                    <span style={{ fontSize: '1.1rem' }}>+</span>
                                    {isEditing ? 'Update Supplier' : 'Register Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}




            {/* Supplier Items Modal */}
            {showOrdersModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '700px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
                        <button onClick={() => setShowOrdersModal(false)} style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                            <X size={24} />
                        </button>
                        
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '32px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Package size={28} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Items by {selectedSupplier?.name}</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Current inventory provided by this supplier.</p>
                            </div>
                        </div>

                        {itemsLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading inventory items...</div>
                        ) : supplierItems.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', background: '#f8fafc', borderRadius: '16px' }}>
                                <ShoppingBag size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                                <p style={{ fontWeight: 600 }}>No inventory items linked to this supplier yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {supplierItems.map(item => (
                                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#64748b', border: '1px solid #e2e8f0' }}>
                                                {item.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, color: '#1e293b' }}>{item.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{item.category}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ 
                                                fontSize: '1.1rem', fontWeight: 800, 
                                                color: item.qty <= item.minStockThreshold ? '#ef4444' : '#1e293b' 
                                            }}>
                                                {item.qty} {item.unit}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>
                                                {item.status.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button 
                            onClick={() => setShowOrdersModal(false)}
                            style={{ 
                                width: '100%', padding: '14px', background: '#f1f5f9', 
                                color: '#475569', border: 'none', borderRadius: '12px', 
                                fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', marginTop: '32px'
                            }}
                        >
                            Close View
                        </button>
                    </div>
                </div>
            )}
            
            {showSuccess && (
                <div style={{ 
                    position: 'fixed', bottom: '40px', right: '40px', 
                    background: '#10b981', 
                    padding: '16px 25px', borderRadius: '16px', color: 'white', fontWeight: 700, zIndex: 3000, 
                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)', 
                    display: 'flex', alignItems: 'center', gap: '12px',
                    animation: 'slideInRight 0.3s ease-out'
                }}>
                    <CheckCircle2 size={20} />
                    {showSuccess}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && supplierToDelete && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', borderRadius: '16px', width: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(135deg, #5c3a21 0%, #7f1d1d 100%)', padding: '24px 32px', color: 'white', position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Trash2 size={24} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Delete Supplier</h3>
                            </div>
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)}
                                style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '32px', textAlign: 'center' }}>
                            <div style={{ 
                                width: '64px', height: '64px', borderRadius: '50%', background: '#fff1f1', 
                                color: '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                margin: '0 auto 20px auto' 
                            }}>
                                <Trash2 size={32} />
                            </div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: '0 0 10px 0' }}>Confirm Deletion</h4>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                                Are you sure you want to remove <strong style={{ color: '#1e293b' }}>{supplierToDelete.name}</strong>? 
                                This action cannot be undone.
                            </p>
                        </div>
                        <div style={{ padding: '0 32px 32px 32px', display: 'flex', gap: '12px' }}>
                            <button 
                                onClick={() => { setIsDeleteModalOpen(false); setSupplierToDelete(null); }}
                                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                disabled={deleteLoading}
                                style={{ 
                                    flex: 1, padding: '12px', borderRadius: '12px', border: 'none', 
                                    background: '#9f1239', color: 'white', fontWeight: 700, cursor: deleteLoading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 12px rgba(159,18,57,0.2)', transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                {deleteLoading ? <RotateCw size={16} className="spin" /> : <Trash2 size={16} />}
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default SuppliersView;

