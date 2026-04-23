import React, { useState } from 'react';
import { RotateCw, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const RestockModal = ({ isOpen, onClose, item, onSuccess }) => {
    const [restockQty, setRestockQty] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !item) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!restockQty || Number(restockQty) <= 0) {
            setError('Quantity must be greater than 0');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/inventory/restock', {
                inventoryId: item._id,
                restockQty: Number(restockQty)
            });
            onSuccess(`${item.name} restocked successfully!`);
            handleClose();
        } catch (err) {
            console.error('Error restocking item:', err);
            setError('Failed to restock item.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setRestockQty('');
        setError('');
        onClose();
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'white', borderRadius: '16px', width: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
                <div style={{ background: '#5c3a21', padding: '24px 32px', color: 'white', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff' }}>
                                <RotateCw size={24} />
                                Restock Item
                            </h3>
                            <p style={{ color: '#fed7aa', fontSize: '0.9rem', margin: '4px 0 0 0', opacity: 0.9 }}>Add new quantity to current stock</p>
                        </div>
                        <button onClick={handleClose} style={{ 
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
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>Item Name</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{item.name}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#fff7ed', borderRadius: '10px', border: '1px solid #fed7aa' }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#9a3412', fontWeight: 800, textTransform: 'uppercase' }}>Current Stock</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ea580c' }}>{item.qty} {item.unit}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', color: '#9a3412', fontWeight: 800, textTransform: 'uppercase' }}>Minimum Stock Level</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#9a3412' }}>{item.minStockThreshold} {item.unit}</div>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#7f5539', textTransform: 'uppercase', marginBottom: '8px' }}>Quantity to Add *</label>
                        <input 
                            type="number" 
                            autoFocus
                            value={restockQty}
                            onChange={(e) => {
                                setRestockQty(e.target.value);
                                if (Number(e.target.value) <= 0) setError('Quantity must be greater than 0');
                                else setError('');
                            }}
                            placeholder={`Enter amount in ${item.unit}...`}
                            style={{
                                width: '100%',
                                padding: '14px 20px',
                                borderRadius: '12px',
                                border: error ? '1px solid #ef4444' : '1px solid #f3e8e0',
                                background: '#fdfaf8',
                                outline: 'none',
                                color: '#432818',
                                fontSize: '1rem',
                                fontWeight: 500,
                                boxSizing: 'border-box',
                                transition: 'all 0.2s ease',
                                boxShadow: 'inset 0 2px 4px rgba(67, 40, 24, 0.02)'
                            }}
                        />
                        {error && <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12} /> {error}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                        <button type="button" onClick={handleClose} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #7f5539 0%, #432818 100%)', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {loading ? <RotateCw className="spin" size={18} /> : <CheckCircle2 size={18} />}
                            Confirm Restock
                        </button>
                    </div>
                </form>
                <style>{`
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        </div>
    );
};

export default RestockModal;
