import React from 'react';
import {
    LayoutDashboard,
    Home,
    Calendar,
    MessageSquare,
    Info,
    Mail,
    LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/unicafe_logo_vintage.png';

const AdminNavbar = ({ activeTab, setActiveTab }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        window.location.reload();
    };

    const links = [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { id: 'home', name: 'Home Page', icon: Home, path: '/' },
        { id: 'calendar', name: 'Calendar', icon: Calendar, path: '/calendar' },
        { id: 'feedback', name: 'Feedback', icon: MessageSquare, path: '/feedback' },
        { id: 'about', name: 'About Us', icon: Info, path: '/about' },
        { id: 'contact', name: 'Contact', icon: Mail, path: '/contact' }
    ];

    const handleItemClick = (item) => {
        if (item.path) {
            navigate(item.path);
        } else {
            setActiveTab(item.id);
        }
    };

    return (
        <nav style={{
            width: '100%',
            height: '70px',
            background: '#ffffff',
            color: 'var(--coffee-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(59, 31, 14, 0.04)',
            boxSizing: 'border-box',
            borderBottom: '1px solid var(--latte-border)'
        }}>
            {/* Logo Area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img src={logo} alt="UniCafé Logo" style={{ height: '48px', objectFit: 'contain' }} />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: 'var(--coffee-dark)', letterSpacing: '-0.5px' }}>
                    UniCafe<span style={{ color: 'var(--latte-highlight)' }}>ADMIN</span>
                </h2>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {links.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            borderRadius: '50px',
                            border: 'none',
                            background: activeTab === item.id ? 'var(--coffee-dark)' : 'transparent',
                            color: activeTab === item.id ? '#ffffff' : 'var(--coffee-muted)',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            transition: 'all 0.2s ease',
                        }}
                        onMouseOver={(e) => {
                            if (activeTab !== item.id) {
                                e.currentTarget.style.background = 'rgba(59, 31, 14, 0.05)';
                                e.currentTarget.style.color = 'var(--coffee-dark)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (activeTab !== item.id) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--coffee-muted)';
                            }
                        }}
                    >
                        <item.icon size={18} />
                        <span>{item.name}</span>
                    </button>
                ))}

                <div style={{ width: '1px', height: '30px', background: 'var(--latte-border)', margin: '0 15px' }} />

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 22px',
                        borderRadius: '50px',
                        border: '1px solid var(--latte-border)',
                        background: '#faf7f2',
                        color: 'var(--coffee-dark)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.borderColor = '#ef4444';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = '#faf7f2';
                        e.currentTarget.style.color = 'var(--coffee-dark)';
                        e.currentTarget.style.borderColor = 'var(--latte-border)';
                    }}
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </nav>
    );
};

export default AdminNavbar;
