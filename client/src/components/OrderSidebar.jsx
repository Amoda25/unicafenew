import React from 'react';
import {
    LayoutDashboard,
    Utensils,
    ClipboardList,
    Home,
    Calendar,
    MessageSquare,
    Info,
    Mail,
    Settings,
    LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/unicafe_logo_vintage.png'; // Assuming it's the same path

const OrderSidebar = ({ activeTab, setActiveTab }) => {
    const navigate = useNavigate();

    const menuGroups = [
        {
            title: 'CORE SERVICES',
            items: [
                { id: 'dashboard', name: 'Dashboard Overview', icon: LayoutDashboard }
            ]
        },
        {
            title: 'ORDER SYSTEM',
            items: [
                { id: 'orders', name: 'Orders & Queue', icon: ClipboardList, path: '/orders?tab=orders' },
                { id: 'menu', name: 'Menu Management', icon: Utensils, path: '/menu-admin' },
                { id: 'calendar', name: 'Calendar', icon: Calendar, path: '/orders?tab=calendar' }
            ]
        },
        {
            title: 'SITE PAGES',
            items: [
                { id: 'home', name: 'Home Page', icon: Home, path: '/' },
                { id: 'feedback', name: 'Feedback', icon: MessageSquare, path: '/feedback' },
                { id: 'about', name: 'About Us', icon: Info, path: '/about' },
                { id: 'contact', name: 'Contact', icon: Mail, path: '/contact' }
            ]
        }
    ];

    const handleItemClick = (item) => {
        if (item.path) {
            navigate(item.path);
        } else if (item.id === 'menu') {
            navigate('/menu-admin');
        } else {
            setActiveTab(item.id);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        window.location.reload();
    };

    return (
        <aside className="admin-sidebar sidebar-modern" style={{
            width: '280px',
            height: 'calc(100vh - 50px)',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: '50px',
            left: 0,
            overflowY: 'auto',
            zIndex: 100
        }}>
            {/* Logo Area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '30px 20px', paddingBottom: '10px' }}>
                <img src={logo} alt="UniCafé Logo" style={{ height: '48px', objectFit: 'contain' }} />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--coffee-dark)', letterSpacing: '-0.5px' }}>
                    UniCafe<span style={{ color: 'var(--latte-highlight)' }}>ORDERS</span>
                </h2>
            </div>

            {/* Navigation Groups */}
            <div style={{ flex: 1, padding: '20px 0' }}>
                {menuGroups.map((group, idx) => (
                    <div key={idx} style={{ marginBottom: '35px' }}>
                        <h3 style={{
                            fontSize: '0.75rem',
                            color: 'var(--coffee-soft)',
                            fontWeight: 800,
                            paddingLeft: '30px',
                            marginBottom: '15px',
                            letterSpacing: '1.5px'
                        }}>
                            {group.title}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {group.items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleItemClick(item)}
                                    className={`sidebar-nav-item-modern ${activeTab === item.id ? 'active' : ''}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        background: activeTab === item.id ? 'var(--coffee-dark)' : 'transparent',
                                        color: activeTab === item.id ? '#ffffff' : 'var(--coffee-muted)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        width: '100%',
                                        textAlign: 'left',
                                        fontWeight: activeTab === item.id ? 700 : 600,
                                        transition: 'all 0.2s ease',
                                        marginBottom: '4px'
                                    }}
                                >
                                    <item.icon size={20} />
                                    <span>{item.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* User Profile Summary or Logout */}
            <div style={{ padding: '30px 20px', borderTop: '1px solid var(--latte-border)' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: 'calc(100% - 40px)',
                        margin: '0 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        border: '1px solid var(--latte-border)',
                        background: '#fff',
                        color: 'var(--coffee-dark)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(59,31,14,0.04)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.borderColor = '#ef4444';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.color = 'var(--coffee-dark)';
                        e.currentTarget.style.borderColor = 'var(--latte-border)';
                    }}
                >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default OrderSidebar;
