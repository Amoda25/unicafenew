import React, { useState, useEffect, useCallback } from 'react';
import { Package, AlertTriangle, Clock, Users, ShieldAlert, ShieldCheck, ShieldX, ArrowUpRight, TrendingDown, RefreshCw, Zap, Trash2, X, RotateCw } from 'lucide-react';
import axios from 'axios';
import InventorySidebar from '../components/InventorySidebar';
import InventoryView from '../components/InventoryView';
import SuppliersView from '../components/SuppliersView';
import UsageStockView from '../components/UsageStockView';

const InventoryDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);

    // Dispose confirmation state
    const [isDisposeModalOpen, setIsDisposeModalOpen] = useState(false);
    const [itemToDispose, setItemToDispose] = useState(null);
    const [disposeLoading, setDisposeLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState('');

    // Smart alert state
    const [alerts, setAlerts]             = useState([]);
    const [alertsLoading, setAlertsLoading] = useState(false);
    const [lastComputed, setLastComputed]  = useState(null);
    const [recalculating, setRecalculating] = useState(false);

    // ── Data fetchers ────────────────────────────────────────────────────────
    const fetchInventory = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/inventory');
            setInventory(res.data);
        } catch (err) {
            console.error('Error fetching inventory:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAlerts = useCallback(async () => {
        setAlertsLoading(true);
        try {
            const res = await axios.get('/api/inventory/low-stock-alerts');
            setAlerts(res.data.alerts || []);
            setLastComputed(res.data.computedAt ? new Date(res.data.computedAt) : null);
        } catch (err) {
            console.error('Error fetching alerts:', err);
        } finally {
            setAlertsLoading(false);
        }
    }, []);

    const fetchDashboardData = useCallback(() => {
        fetchInventory();
        fetchAlerts();
    }, [fetchInventory, fetchAlerts]);

    const handleRecalculate = async () => {
        setRecalculating(true);
        try {
            await axios.post('/api/inventory/recalculate-alerts');
            await Promise.all([fetchAlerts(), fetchInventory()]);
        } catch (err) {
            console.error('Recalculate error:', err);
        } finally {
            setRecalculating(false);
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
            fetchDashboardData();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            console.error('Error disposing item:', err);
            alert('Failed to dispose item.');
        } finally {
            setDisposeLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchDashboardData();
            
            // Real-time auto-refresh every 30 seconds
            const interval = setInterval(() => {
                fetchDashboardData();
            }, 30000);
            
            return () => clearInterval(interval);
        }
    }, [activeTab, fetchDashboardData]);

    // ── Derived stats ────────────────────────────────────────────────────────
    const totalIngredients = inventory.length;
    const criticalItems    = alerts.filter(a => a.stockStatus === 'CRITICAL');
    const lowStockOnly     = alerts.filter(a => a.stockStatus === 'LOW STOCK');
    const totalAlertCount  = alerts.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    const expiredItems     = inventory.filter(item => item.expiry && new Date(item.expiry) < today);
    const expiringSoonItems= inventory.filter(item => item.expiry && new Date(item.expiry) >= today && new Date(item.expiry) <= threeDaysFromNow);
    const safeItemsCount   = totalIngredients - expiredItems.length - expiringSoonItems.length;

    // ── Badge helpers ────────────────────────────────────────────────────────
    const statusStyle = (status) => ({
        CRITICAL:   { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', leftBar: '#dc2626' },
        'LOW STOCK':{ bg: '#fff7ed', color: '#ea580c', border: '#fed7aa', leftBar: '#f97316' },
        GOOD:       { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', leftBar: '#22c55e' },
    }[status] || { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', leftBar: '#94a3b8' });

    const daysLeftBadge = (item) => {
        if (item.stockDaysLeft === null) return { text: 'No usage data', bg: '#f1f5f9', color: '#94a3b8' };
        if (item.stockDaysLeft === 0)    return { text: 'Out of stock soon!', bg: '#fee2e2', color: '#dc2626' };
        if (item.stockDaysLeft < 3)      return { text: `${item.stockDaysLeft} day${item.stockDaysLeft !== 1 ? 's' : ''} left`, bg: '#fee2e2', color: '#dc2626' };
        return { text: `${item.stockDaysLeft} days left`, bg: '#fff7ed', color: '#ea580c' };
    };

    return (
        <div style={{ display: 'flex', background: 'var(--bg-page)', width: '100%', fontFamily: '"Inter", sans-serif', animation: 'fadeIn 0.5s ease-out' }}>
            <InventorySidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
                <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>

                    {activeTab === 'dashboard' && (
                        <div>
                            {/* ── Dashboard Header ─────────────────────────────── */}
                            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Dashboard Overview</h1>
                                    {lastComputed && (
                                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                                            Stock alerts last computed: {lastComputed.toLocaleTimeString()}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={handleRecalculate}
                                    disabled={recalculating}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '10px 20px', background: recalculating ? '#e2e8f0' : 'linear-gradient(135deg, #6f4e37 0%, #4b2c20 100%)',
                                        color: recalculating ? '#94a3b8' : 'white', border: 'none', borderRadius: '10px',
                                        fontSize: '0.875rem', fontWeight: 700, cursor: recalculating ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 4px 12px rgba(111, 78, 55, 0.25)', transition: 'all 0.2s'
                                    }}
                                >
                                    <RefreshCw size={16} style={{ animation: recalculating ? 'spin 1s linear infinite' : 'none' }} />
                                    {recalculating ? 'Recalculating...' : 'Refresh Alerts'}
                                </button>
                            </div>

                            {/* ── Stat Cards ──────────────────────────────────── */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                                {/* Total Ingredients */}
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

                                {/* Smart Alert Count */}
                                <div className="glass" style={{ padding: '24px', border: totalAlertCount > 0 ? '1px solid #fed7aa' : undefined }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Low Stock Alerts</div>
                                            <div style={{ fontSize: '2rem', fontWeight: 800, color: totalAlertCount > 0 ? '#ea580c' : '#1e293b' }}>{totalAlertCount}</div>
                                        </div>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: totalAlertCount > 0 ? '#fff7ed' : '#fef3c7', color: totalAlertCount > 0 ? '#ea580c' : '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <AlertTriangle size={24} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {criticalItems.length > 0 && (
                                            <span style={{ padding: '3px 10px', background: '#fee2e2', color: '#dc2626', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 800 }}>
                                                {criticalItems.length} CRITICAL
                                            </span>
                                        )}
                                        {lowStockOnly.length > 0 && (
                                            <span style={{ padding: '3px 10px', background: '#fff7ed', color: '#ea580c', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 800 }}>
                                                {lowStockOnly.length} LOW
                                            </span>
                                        )}
                                        {totalAlertCount === 0 && (
                                            <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.875rem' }}>All stocks healthy</span>
                                        )}
                                    </div>
                                </div>

                                {/* Expired Items */}
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
                                    <span style={{ color: expiredItems.length > 0 ? '#ef4444' : '#10b981', fontWeight: 700, fontSize: '0.875rem' }}>
                                        {expiredItems.length > 0 ? 'Action required' : 'No expired items'}
                                    </span>
                                </div>

                                {/* Active Suppliers */}
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

                            {/* ── Main Content Grid ────────────────────────────── */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 1fr) 2fr', gap: '24px' }}>

                                {/* ── LEFT: Smart Low-Stock Alerts Panel ─────────── */}
                                <div className="glass" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    {/* Panel Header */}
                                    <div style={{
                                        background: totalAlertCount > 0
                                            ? 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)'
                                            : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                                        padding: '20px 24px',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                            <AlertTriangle size={20} />
                                            Low-Stock Alerts
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '99px', color: 'white', fontSize: '0.72rem', fontWeight: 800 }}>
                                                {totalAlertCount} Warnings
                                            </span>
                                            {alertsLoading && (
                                                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Alert Legend */}
                                    {totalAlertCount > 0 && (
                                        <div style={{ padding: '12px 24px', background: '#fafafa', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '16px' }}>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }} />
                                                CRITICAL &lt; 3 days
                                            </span>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ea580c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }} />
                                                LOW STOCK
                                            </span>
                                        </div>
                                    )}

                                    {/* Alert Items */}
                                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {alertsLoading && alerts.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                                                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
                                                <p style={{ margin: 0, fontSize: '0.875rem' }}>Computing stock levels...</p>
                                            </div>
                                        ) : alerts.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                                <ShieldCheck size={40} style={{ color: '#10b981', marginBottom: '12px' }} />
                                                <p style={{ color: '#10b981', fontWeight: 700, margin: '0 0 4px 0' }}>All Stocks Healthy</p>
                                                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>No low stock items detected</p>
                                            </div>
                                        ) : (
                                            alerts.map((item, idx) => {
                                                const s = statusStyle(item.stockStatus);
                                                const badge = daysLeftBadge(item);
                                                return (
                                                    <div key={item._id || idx} style={{
                                                        background: s.bg,
                                                        border: `1px solid ${s.border}`,
                                                        borderLeft: `4px solid ${s.leftBar}`,
                                                        borderRadius: '12px',
                                                        padding: '14px 16px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '8px'
                                                    }}>
                                                        {/* Row 1: Name + Status badge */}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                {item.stockStatus === 'CRITICAL'
                                                                    ? <Zap size={15} style={{ color: s.color }} />
                                                                    : <TrendingDown size={15} style={{ color: s.color }} />
                                                                }
                                                                <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem' }}>{item.name}</span>
                                                            </div>
                                                            <span style={{
                                                                padding: '3px 10px', background: s.leftBar, color: 'white',
                                                                borderRadius: '99px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.05em'
                                                            }}>
                                                                {item.stockStatus}
                                                            </span>
                                                        </div>

                                                        {/* Row 2: Alert message */}
                                                        <p style={{ margin: 0, fontSize: '0.8rem', color: s.color, fontWeight: 600, lineHeight: 1.4 }}>
                                                            ⚠ {item.alertMessage}
                                                        </p>

                                                        {/* Row 3: Usage stats */}
                                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                            {/* Days left pill */}
                                                            <span style={{
                                                                padding: '3px 10px', background: badge.bg, color: badge.color,
                                                                borderRadius: '99px', fontSize: '0.72rem', fontWeight: 800, border: `1px solid ${badge.color}40`
                                                            }}>
                                                                ⏱ {badge.text}
                                                            </span>
                                                            {/* Current stock */}
                                                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                                                                Stock: <strong style={{ color: '#1e293b' }}>{item.qty} {item.unit}</strong>
                                                            </span>
                                                            {/* Daily usage */}
                                                            {item.dailyUsage > 0 && (
                                                                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                                                                    Usage: <strong style={{ color: '#1e293b' }}>{item.dailyUsage}/day</strong>
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Row 4: Manage button */}
                                                        <button
                                                            onClick={() => setActiveTab('inventory')}
                                                            style={{
                                                                alignSelf: 'flex-end', padding: '6px 14px',
                                                                background: 'white', border: `1px solid ${s.border}`,
                                                                borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700,
                                                                color: s.color, cursor: 'pointer', transition: 'all 0.2s'
                                                            }}
                                                            onMouseOver={e => { e.currentTarget.style.background = s.bg; }}
                                                            onMouseOut={e => { e.currentTarget.style.background = 'white'; }}
                                                        >
                                                            RESTOCK
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* ── RIGHT: Expiry Status + Overview Table ─────── */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.5s ease-out' }}>

                                    {/* Recent Expiry Status */}
                                    <div className="glass" style={{ overflow: 'hidden', padding: 0 }}>
                                        <div style={{ background: 'linear-gradient(135deg, #5c3a21 0%, #7f1d1d 100%)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                                <ShieldCheck size={20} />
                                                Recent Expiry Status
                                            </h3>
                                        </div>
                                        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                            {/* Expired */}
                                            <div style={{ border: '1px solid #fecaca', background: '#fff0f0', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                                                <ShieldX size={80} style={{ position: 'absolute', top: '-10px', right: '-10px', color: '#fee2e2', opacity: 0.5 }} />
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', position: 'relative', zIndex: 1 }}><ShieldX size={20} /></div>
                                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ef4444', lineHeight: 1, position: 'relative', zIndex: 1 }}>{expiredItems.length}</div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b91c1c', letterSpacing: '0.05em', marginTop: '8px', textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>Expired Items</div>
                                            </div>
                                            {/* Expiring Soon */}
                                            <div style={{ border: '1px solid #fde68a', background: '#fffbeb', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                                                <ShieldAlert size={80} style={{ position: 'absolute', top: '-10px', right: '-10px', color: '#fef3c7', opacity: 0.5 }} />
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', position: 'relative', zIndex: 1 }}><ShieldAlert size={20} /></div>
                                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#d97706', lineHeight: 1, position: 'relative', zIndex: 1 }}>{expiringSoonItems.length}</div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309', letterSpacing: '0.05em', marginTop: '8px', textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>Expiring Soon</div>
                                                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#d97706', marginTop: '4px', position: 'relative', zIndex: 1 }}>within 3 days</div>
                                            </div>
                                            {/* Safe */}
                                            <div style={{ border: '1px solid #a7f3d0', background: '#f0fdf4', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                                                <ShieldCheck size={80} style={{ position: 'absolute', top: '-10px', right: '-10px', color: '#dcfce7', opacity: 0.5 }} />
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dcfce7', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', position: 'relative', zIndex: 1 }}><ShieldCheck size={20} /></div>
                                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10b981', lineHeight: 1, position: 'relative', zIndex: 1 }}>{safeItemsCount}</div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', letterSpacing: '0.05em', marginTop: '8px', textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>Safe Items</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Inventory Overview Table */}
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
                                                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Countdown</th>
                                                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                                                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {inventory.slice(0, 5).map((row, idx) => {
                                                    const isExpired      = row.expiry && new Date(row.expiry) < today;
                                                    const isExpiringSoon = row.expiry && new Date(row.expiry) >= today && new Date(row.expiry) <= threeDaysFromNow;

                                                    let countdownText  = 'No expiry';
                                                    let countdownBg    = '#f1f5f9';
                                                    let countdownColor = '#94a3b8';
                                                    if (row.expiry) {
                                                        const diffDays = Math.round((new Date(row.expiry) - today) / (1000 * 60 * 60 * 24));
                                                        if (diffDays < 0)     { countdownText = `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`; countdownBg = '#fee2e2'; countdownColor = '#ef4444'; }
                                                        else if (diffDays === 0) { countdownText = 'Expires today'; countdownBg = '#fee2e2'; countdownColor = '#ef4444'; }
                                                        else                  { countdownText = `${diffDays} day${diffDays !== 1 ? 's' : ''} left`; countdownBg = isExpiringSoon ? '#fef3c7' : '#dcfce7'; countdownColor = isExpiringSoon ? '#d97706' : '#10b981'; }
                                                    }

                                                    return (
                                                        <tr key={idx} style={{ borderBottom: idx < Math.min(inventory.length, 5) - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                                            <td style={{ padding: '16px', fontWeight: 700, color: '#1e293b' }}>{row.name}</td>
                                                            <td style={{ padding: '16px', color: '#64748b', fontSize: '0.875rem' }}>{row.category}</td>
                                                            <td style={{ padding: '16px', color: '#1e293b', fontSize: '0.875rem' }}>{row.expiry || 'N/A'}</td>
                                                            <td style={{ padding: '16px' }}>
                                                                <span style={{ padding: '6px 12px', background: countdownBg, color: countdownColor, borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, display: 'inline-block', whiteSpace: 'nowrap' }}>
                                                                    {countdownText}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '16px' }}>
                                                                <span style={{ padding: '6px 12px', background: isExpired ? '#fee2e2' : isExpiringSoon ? '#fef3c7' : '#dcfce7', color: isExpired ? '#ef4444' : isExpiringSoon ? '#d97706' : '#10b981', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                                                                    {isExpired ? 'EXPIRED' : isExpiringSoon ? 'EXPIRING SOON' : 'GOOD'}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                                {isExpired && (
                                                                    <button 
                                                                        onClick={() => setActiveTab('inventory')}
                                                                        style={{ 
                                                                            background: '#9f1239', color: 'white', border: 'none', 
                                                                            padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', 
                                                                            fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(159,18,57,0.2)',
                                                                            transition: 'all 0.2s'
                                                                        }}
                                                                        onMouseOver={e=>e.currentTarget.style.background='#881337'}
                                                                        onMouseOut={e=>e.currentTarget.style.background='#9f1239'}
                                                                    >
                                                                        Dispose
                                                                    </button>
                                                                )}
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

                    {activeTab === 'inventory'  && <InventoryView />}
                    {activeTab === 'usage'      && <UsageStockView />}
                    {activeTab === 'suppliers'  && <SuppliersView />}
                </div>
            </main>

            {/* Dispose Confirmation Modal */}
            {isDisposeModalOpen && itemToDispose && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' }}>
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
                                You are about to dispose of <strong style={{ color: '#1e293b' }}>{itemToDispose.name}</strong>. 
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

            {showSuccess && (
                <div style={{ 
                    position: 'fixed', bottom: '40px', right: '40px', 
                    background: '#e11d48', 
                    padding: '16px 25px', borderRadius: '16px', color: 'white', fontWeight: 700, zIndex: 3000, 
                    boxShadow: '0 10px 30px rgba(225,29,72,0.3)', 
                    display: 'flex', alignItems: 'center', gap: '12px' 
                }}>
                    <ShieldCheck size={20} />
                    {showSuccess}
                </div>
            )}

            {/* Spinner keyframes */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default InventoryDashboard;
