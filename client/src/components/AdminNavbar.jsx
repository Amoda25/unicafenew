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
import logo from '../assets/unicafe_logo_orange.png'; // Fallback if no specific logo available

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
            height: '80px',
            background: 'linear-gradient(90deg, rgba(234, 88, 12, 1) 0%, rgba(194, 65, 12, 1) 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 4px 20px rgba(234, 88, 12, 0.3)',
            boxSizing: 'border-box'
        }}>
            {/* Logo Area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img src={logo} alt="UniCafé Logo" style={{ height: '45px', width: '45px', objectFit: 'cover', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'white', letterSpacing: '-0.5px' }}>
                    UniCafe<span style={{ color: '#FFB800' }}>ADMIN</span>
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
                            padding: '10px 18px',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === item.id ? 'rgba(255,255,255,1)' : 'transparent',
                            color: activeTab === item.id ? '#ea580c' : 'rgba(255,255,255,0.8)',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: activeTab === item.id ? 700 : 600,
                            transition: 'all 0.3s ease',
                        }}
                        onMouseOver={(e) => {
                            if (activeTab !== item.id) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.color = '#ffffff';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (activeTab !== item.id) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                            }
                        }}
                    >
                        <item.icon size={18} style={{ color: activeTab === item.id ? '#ea580c' : 'inherit' }} />
                        <span>{item.name}</span>
                    </button>
                ))}

                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.2)', margin: '0 15px' }} />

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                        e.currentTarget.style.borderColor = '#ef4444';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
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
