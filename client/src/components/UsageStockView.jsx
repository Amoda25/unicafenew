import React, { useState, useEffect, useCallback } from 'react';
import { 
    Activity, 
    ArrowRight, 
    Calendar as CalendarIcon, 
    ChevronRight, 
    Clock, 
    History, 
    Info, 
    Save, 
    Trash2, 
    TrendingDown, 
    Zap,
    Scale,
    ClipboardList,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';

const UsageStockView = () => {
    // --- STATE DEFINITIONS ---
    const [inventory, setInventory] = useState([]); // List of items to choose from
    const [usageHistory, setUsageHistory] = useState([]); // Log of past consumption
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [qtyError, setQtyError] = useState(''); // Real-time error if usage > stock

    const [formData, setFormData] = useState({
        inventoryId: '', // Selected ingredient
        usedQty: '', // Amount used today
        date: new Date().toISOString().split('T')[0], // Default to today
        notes: ''
    });
    // -------------------------

    // ── Data Fetching ────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [invRes, histRes] = await Promise.all([
                axios.get('/api/inventory'),
                axios.get('/api/inventory/usage-history')
            ]);
            setInventory(invRes.data);
            setUsageHistory(histRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Derived Data ─────────────────────────────────────────────────────────
    const selectedItem = inventory.find(item => item._id === formData.inventoryId);
    
    // Preview calculation
    const currentQty = selectedItem ? selectedItem.qty : 0;
    const usedQtyNum = Number(formData.usedQty) || 0;
    const remainingQty = Math.max(0, currentQty - usedQtyNum);
    
    // --- STATUS PREDICTION ---
    // Predicts what the stock status will be AFTER this usage is logged.
    // Helps admin see if they are about to run out of an item.
    const getStatusPrediction = () => {
        if (!selectedItem) return { text: 'N/A', color: '#94a3b8', bg: '#f1f5f9' };
        
        const threshold = selectedItem.minStockThreshold || 10;
        if (remainingQty <= Math.floor(threshold / 2)) {
            return { text: 'CRITICAL', color: '#ef4444', bg: '#fee2e2' };
        } else if (remainingQty <= threshold) {
            return { text: 'LOW STOCK', color: '#f59e0b', bg: '#fffbeb' };
        }
        return { text: 'STOCK OK', color: '#10b981', bg: '#dcfce7' };
    };
    // -------------------------

    const statusPred = getStatusPrediction();

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when changing item
        if (name === 'inventoryId') {
            setQtyError('');
        }
    };

    // --- QUANTITY VALIDATION ---
    const handleQtyChange = (e) => {
        const value = e.target.value;
        const numValue = Number(value);
        
        setFormData(prev => ({ ...prev, usedQty: value }));
        
        if (!value) {
            setQtyError('');
            return;
        }

        // Rule 1: Cannot use 0 or negative
        if (numValue <= 0) {
            setQtyError('Quantity must be greater than 0');
        } 
        // Rule 2: Cannot use more than what we actually have in stock
        else if (selectedItem && numValue > selectedItem.qty) {
            setQtyError(`Insufficient stock! Max available: ${selectedItem.qty} ${selectedItem.unit}`);
        } else {
            setQtyError('');
        }
    };
    // ----------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (qtyError) return;

        if (!formData.inventoryId || !formData.usedQty) {
            alert('Please select an item and enter used quantity.');
            return;
        }

        setSubmitting(true);
        try {
            await axios.post('/api/inventory/usage', formData);
            setSuccessMessage('Usage updated successfully!');
            setFormData({
                inventoryId: '',
                usedQty: '',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            });
            fetchData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error logging usage:', err);
            alert('Failed to update usage. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClear = () => {
        setFormData({
            inventoryId: '',
            usedQty: '',
            date: new Date().toISOString().split('T')[0],
            notes: ''
        });
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.5s ease-out' }}>
            
            {/* Header Section */}
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--coffee-dark)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Activity size={32} style={{ color: 'var(--latte-highlight)' }} />
                    Usage Stock
                </h1>

            </div>

            {successMessage && (
                <div style={{ 
                    position: 'fixed', bottom: '40px', right: '40px', 
                    background: '#10b981', 
                    padding: '16px 25px', borderRadius: '16px', color: 'white', fontWeight: 700, zIndex: 3000, 
                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)', 
                    display: 'flex', alignItems: 'center', gap: '12px',
                    animation: 'slideInRight 0.3s ease-out'
                }}>
                    <CheckCircle2 size={20} />
                    {successMessage}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1.5fr) 1fr', gap: '24px', alignItems: 'start' }}>
                
                {/* ── LEFT: Daily Usage Update Form ── */}
                <div className="glass" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--coffee-dark)', margin: 0 }}>Daily Usage Update</h3>

                    </div>

                    <p style={{ color: 'var(--coffee-soft)', fontSize: '0.9rem', margin: 0 }}>
                        Select an item and update the used quantity for the day.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        
                        {/* Select Item */}
                        <div style={{ gridColumn: '1 / 2' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--coffee-dark)', marginBottom: '8px' }}>Select Item *</label>
                            <select 
                                name="inventoryId"
                                value={formData.inventoryId}
                                onChange={handleChange}
                                className="glass-input"
                                style={{ width: '100%', height: '52px' }}
                                required
                            >
                                <option value="">Choose an ingredient...</option>
                                {inventory.map(item => (
                                    <option key={item._id} value={item._id}>{item.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Current Quantity (Read-only) */}
                        <div style={{ gridColumn: '2 / 3' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--coffee-dark)', marginBottom: '8px' }}>Current Quantity</label>
                            <div style={{ 
                                height: '52px', background: '#f8fafc', border: '1px solid #e2e8f0', 
                                borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '0 16px',
                                fontWeight: 700, color: '#1e293b', fontSize: '1.1rem'
                            }}>
                                {selectedItem ? `${selectedItem.qty} ${selectedItem.unit}` : '-'}
                            </div>
                        </div>

                        {/* Used Quantity */}
                        <div style={{ gridColumn: '1 / 2' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--coffee-dark)', marginBottom: '8px' }}>Used Quantity *</label>
                            <input 
                                type="number"
                                name="usedQty"
                                value={formData.usedQty}
                                onChange={handleQtyChange}
                                className="glass-input"
                                placeholder="Enter used quantity"
                                style={{ 
                                    width: '100%', height: '52px',
                                    borderColor: qtyError ? '#ef4444' : 'var(--latte-border)'
                                }}
                                required
                                min="0.001"
                                step="any"
                            />
                            {qtyError && (
                                <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <AlertCircle size={14} />
                                    {qtyError}
                                </div>
                            )}
                        </div>

                        {/* Unit (Read-only) */}
                        <div style={{ gridColumn: '2 / 3' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--coffee-dark)', marginBottom: '8px' }}>Unit</label>
                            <div style={{ 
                                height: '52px', background: '#f8fafc', border: '1px solid #e2e8f0', 
                                borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '0 16px',
                                fontWeight: 600, color: '#64748b'
                            }}>
                                {selectedItem ? selectedItem.unit : '-'}
                            </div>
                        </div>

                        {/* Date */}
                        <div style={{ gridColumn: '1 / 2' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--coffee-dark)', marginBottom: '8px' }}>Date *</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="glass-input"
                                    style={{ width: '100%', height: '52px' }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Min Stock Level (Read-only) */}
                        <div style={{ gridColumn: '2 / 3' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--coffee-dark)', marginBottom: '8px' }}>Minimum Stock Level</label>
                            <div style={{ 
                                height: '52px', background: '#f8fafc', border: '1px solid #e2e8f0', 
                                borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '0 16px',
                                fontWeight: 600, color: '#64748b'
                            }}>
                                {selectedItem ? `${selectedItem.minStockThreshold || 10} ${selectedItem.unit}` : '-'}
                            </div>
                        </div>

                        {/* Notes */}
                        <div style={{ gridColumn: '1 / 3' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--coffee-dark)', marginBottom: '8px' }}>Notes</label>
                            <textarea 
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="glass-input"
                                placeholder="Optional notes about daily usage"
                                style={{ width: '100%', minHeight: '100px', resize: 'none' }}
                            />
                        </div>

                        {/* Buttons */}
                        <div style={{ gridColumn: '1 / 3', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                            <button 
                                type="button" 
                                onClick={handleClear}
                                style={{
                                    padding: '12px 30px', borderRadius: '12px', border: '1px solid var(--latte-border)',
                                    background: 'white', color: 'var(--coffee-dark)', fontWeight: 700, cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Clear
                            </button>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                style={{
                                    padding: '12px 40px', borderRadius: '12px', border: 'none',
                                    background: 'var(--coffee-dark)', color: 'white', fontWeight: 700, cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(59, 31, 14, 0.25)', display: 'flex', alignItems: 'center', gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {submitting ? <Clock size={18} className="spin" /> : <Save size={18} />}
                                Update Usage
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── RIGHT Side: Previews & Rules ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Usage Impact Preview */}
                    <div className="glass" style={{ padding: '24px', background: 'white' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--coffee-dark)', marginBottom: '20px' }}>Usage Impact Preview</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px' }}>
                                <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Current Stock</span>
                                <span style={{ color: '#1e293b', fontWeight: 800 }}>{selectedItem ? `${currentQty} ${selectedItem.unit}` : '-'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px' }}>
                                <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Remaining After Update</span>
                                <span style={{ color: formData.usedQty ? 'var(--latte-highlight)' : '#94a3b8', fontWeight: 800 }}>
                                    {selectedItem && formData.usedQty ? `${remainingQty} ${selectedItem.unit}` : '-'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', alignItems: 'center' }}>
                                <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Low Stock Status</span>
                                <span style={{ 
                                    padding: '4px 12px', borderRadius: '99px', background: statusPred.bg, color: statusPred.color,
                                    fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em'
                                }}>
                                    {statusPred.text}
                                </span>
                            </div>
                        </div>
                    </div>



                </div>

            </div>

            {/* ── BOTTOM: Recent Usage History ── */}
            <div className="glass" style={{ padding: '32px', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--coffee-dark)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <History size={24} style={{ color: 'var(--latte-highlight)' }} />
                            Recent Usage History
                        </h3>

                    </div>
                    <div style={{ padding: '6px 12px', background: '#fef3c7', color: '#d97706', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {usageHistory.length} records
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '0.875rem', fontWeight: 700 }}>Item Name</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '0.875rem', fontWeight: 700 }}>Used Quantity</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '0.875rem', fontWeight: 700 }}>Date</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '0.875rem', fontWeight: 700 }}>Remaining Stock</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: '#64748b', fontSize: '0.875rem', fontWeight: 700 }}>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usageHistory.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                        No usage history found.
                                    </td>
                                </tr>
                            ) : usageHistory.map((log, idx) => (
                                <tr key={log._id || idx} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }} className="hover-row">
                                    <td style={{ padding: '16px', color: 'var(--coffee-dark)', fontWeight: 700 }}>{log.itemName}</td>
                                    <td style={{ padding: '16px', color: 'var(--coffee-muted)', fontWeight: 600 }}>{log.usedQty} {log.unit}</td>
                                    <td style={{ padding: '16px', color: '#64748b' }}>{new Date(log.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '16px', color: 'var(--coffee-dark)', fontWeight: 800 }}>
                                        {log.remainingStock} {log.unit}
                                    </td>
                                    <td style={{ padding: '16px', color: '#64748b', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {log.notes || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideIn { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .hover-row:hover { background: #fdfaf5; }
            `}</style>

        </div>
    );
};

export default UsageStockView;
