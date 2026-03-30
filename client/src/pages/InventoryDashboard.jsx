import React, { useState, useEffect } from 'react';
import { Search, Bell, Package, AlertTriangle, Clock, Users, ShieldAlert, ShieldCheck, ShieldX, CheckCircle2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import axios from 'axios';
import InventorySidebar from '../components/InventorySidebar';
import InventoryView from '../components/InventoryView';
import SuppliersView from '../components/SuppliersView';
import ReportsView from '../components/ReportsView';

const InventoryDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchInventory();
        }
    }, [activeTab]);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/inventory');
            setInventory(response.data);
        } catch (err) {
            console.error('Error fetching inventory for dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate dynamic stats
    const totalIngredients = inventory.length;
    const lowStockItems = inventory.filter(item => item.qty <= (item.minStockThreshold || 10));
    const lowStockCount = lowStockItems.length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    const expiredItems = inventory.filter(item => item.expiry && new Date(item.expiry) < today);
    const expiringSoonItems = inventory.filter(item => item.expiry && new Date(item.expiry) >= today && new Date(item.expiry) <= threeDaysFromNow);
    const safeItemsCount = totalIngredients - expiredItems.length - expiringSoonItems.length;

    const userInitials = "AS";

    return (
        <div style={{ display: 'flex', background: 'var(--bg-page)', width: '100%', fontFamily: '"Inter", sans-serif' }}>
            <InventorySidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>

                {/* Dashboard Content Area */}
                <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
                    {activeTab === 'dashboard' && (
                        <div>
                            {/* Dashboard Header */}
                            <div style={{ marginBottom: '24px' }}>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Dashboard Overview</h1>
                            </div>
                            
                            {/* Stat Cards Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                                {/* Card 1 */}
                                <div className="glass" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Total Ingredients</div>
                                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{totalIngredients}</div>
                                        </div>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Package size={24} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
                                        <ArrowUpRight size={16} style={{ color: '#10b981' }} />
                                        <span style={{ color: '#10b981', fontWeight: 700 }}>Live</span>
                                        <span style={{ color: '#94a3b8' }}>from database</span>
                                    </div>
                                </div>

                                {/* Card 2 */}
                                <div className="glass" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Low Stock Alerts</div>
                                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{lowStockCount}</div>
                                        </div>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <AlertTriangle size={24} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
                                        <span style={{ color: lowStockCount > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>{lowStockCount > 0 ? `${lowStockCount} items need attention` : 'All stocks healthy'}</span>
                                    </div>
                                </div>

                                {/* Card 3 */}
                                <div className="glass" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Expired Items</div>
                                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{expiredItems.length}</div>
                                        </div>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Clock size={24} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
                                        <span style={{ color: expiredItems.length > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>{expiredItems.length > 0 ? 'Action required' : 'No expired items'}</span>
                                    </div>
                                </div>

                                {/* Card 4 */}
                                <div className="glass" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Active Suppliers</div>
                                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>4</div>
                                        </div>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Users size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Main Content Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '24px' }}>
                                {/* Left Column: Low-Stock Alerts */}
                                <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <AlertTriangle size={20} style={{ color: '#ef4444' }} />
                                            Low-Stock Alerts
                                        </h3>
                                        <span style={{ padding: '4px 12px', background: '#fee2e2', color: '#ef4444', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
                                            {lowStockCount} Warnings
                                        </span>
                                    </div>

                                    {/* Alert Items */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {lowStockItems.length === 0 ? (
                                            <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No low stock items</p>
                                        ) : lowStockItems.slice(0, 5).map((item, idx) => (
                                            <div key={idx} style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center', 
                                                padding: '16px', 
                                                borderRadius: '12px', 
                                                border: `1px solid #fde68a`,
                                                background: '#fffbeb',
                                                borderLeft: `4px solid #f59e0b`
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                                    <AlertTriangle size={18} style={{ color: '#f59e0b', marginTop: '2px' }} />
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>{item.name}</div>
                                                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                                            <span style={{ color: '#ef4444', fontWeight: 700 }}>{item.qty} {item.unit}</span> / Min: {item.minStockThreshold || 10}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => setActiveTab('inventory')} style={{ 
                                                    padding: '8px 16px', 
                                                    background: 'white', 
                                                    border: '1px solid #e2e8f0', 
                                                    borderRadius: '8px', 
                                                    fontSize: '0.875rem', 
                                                    fontWeight: 600, 
                                                    color: '#334155',
                                                    cursor: 'pointer'
                                                }}>
                                                    Manage
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Column: Expiry & Table */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    
                                    {/* Recent Expiry Status */}
                                    <div className="glass" style={{ overflow: 'hidden', padding: 0 }}>
                                        <div style={{ background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.85) 0%, rgba(234, 88, 12, 0.85) 100%)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                                <ShieldCheck size={20} />
                                                Recent Expiry Status
                                            </h3>
                                            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '99px', color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>
                                                Live - Database Sync
                                            </span>
                                        </div>
                                        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                            
                                            {/* Expired Items */}
                                            <div style={{ border: '1px solid #fecaca', background: '#fff0f0', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                                                <ShieldX size={80} style={{ position: 'absolute', top: '-10px', right: '-10px', color: '#fee2e2', opacity: 0.5 }} />
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
                                                    <ShieldX size={20} />
                                                </div>
                                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ef4444', lineHeight: 1, position: 'relative', zIndex: 1 }}>{expiredItems.length}</div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b91c1c', letterSpacing: '0.05em', marginTop: '8px', textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>Expired Items</div>
                                            </div>

                                            {/* Expiring Soon */}
                                            <div style={{ border: '1px solid #fde68a', background: '#fffbeb', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                                                <ShieldAlert size={80} style={{ position: 'absolute', top: '-10px', right: '-10px', color: '#fef3c7', opacity: 0.5 }} />
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
                                                    <ShieldAlert size={20} />
                                                </div>
                                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#d97706', lineHeight: 1, position: 'relative', zIndex: 1 }}>{expiringSoonItems.length}</div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309', letterSpacing: '0.05em', marginTop: '8px', textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>Expiring Soon</div>
                                                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#d97706', marginTop: '4px', position: 'relative', zIndex: 1 }}>within 3 days</div>
                                            </div>

                                            {/* Safe Items */}
                                            <div style={{ border: '1px solid #a7f3d0', background: '#f0fdf4', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                                                <ShieldCheck size={80} style={{ position: 'absolute', top: '-10px', right: '-10px', color: '#dcfce7', opacity: 0.5 }} />
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dcfce7', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
                                                    <ShieldCheck size={20} />
                                                </div>
                                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10b981', lineHeight: 1, position: 'relative', zIndex: 1 }}>{safeItemsCount}</div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', letterSpacing: '0.05em', marginTop: '8px', textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>Safe Items</div>
                                            </div>

                                        </div>
                                    </div>
                                    
                                    {/* All Items Table (Small Overview) */}
                                    <div className="glass" style={{ padding: '24px' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Clock size={18} style={{ color: '#64748b' }} />
                                            Recent Inventory Overview
                                        </h3>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Item Name</th>
                                                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
                                                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Expiry Date</th>
                                                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {inventory.slice(0, 5).map((row, idx) => {
                                                    const isExpired = row.expiry && new Date(row.expiry) < today;
                                                    const isExpiringSoon = row.expiry && new Date(row.expiry) >= today && new Date(row.expiry) <= threeDaysFromNow;
                                                    
                                                    return (
                                                        <tr key={idx} style={{ borderBottom: idx < inventory.slice(0, 5).length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                                            <td style={{ padding: '16px', fontWeight: 700, color: '#1e293b' }}>{row.name}</td>
                                                            <td style={{ padding: '16px', color: '#64748b', fontSize: '0.875rem' }}>{row.category}</td>
                                                            <td style={{ padding: '16px', color: '#1e293b', fontSize: '0.875rem' }}>{row.expiry || 'N/A'}</td>
                                                            <td style={{ padding: '16px' }}>
                                                                <span style={{ 
                                                                    padding: '6px 12px', 
                                                                    background: isExpired ? '#fee2e2' : isExpiringSoon ? '#fef3c7' : '#dcfce7', 
                                                                    color: isExpired ? '#ef4444' : isExpiringSoon ? '#d97706' : '#10b981', 
                                                                    borderRadius: '99px',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 800,
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}>
                                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                                                                    {isExpired ? 'EXPIRED' : isExpiringSoon ? 'EXPIRING SOON' : 'GOOD'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'inventory' && (
                        <InventoryView />
                    )}
                    {activeTab === 'suppliers' && (
                        <SuppliersView />
                    )}
                    {activeTab === 'reports' && (
                        <ReportsView />
                    )}
                </div>
            </main>
        </div>
    );
};

export default InventoryDashboard;
