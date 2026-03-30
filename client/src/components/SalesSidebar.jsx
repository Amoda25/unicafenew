import React from 'react';
import {
    LayoutDashboard,
    BarChart3,
    Users,
    Home,
    Calendar,
    MessageSquare,
    Info,
    Mail,
    LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/unicafe_logo_orange.png';

const SalesSidebar = ({ activeTab, setActiveTab }) => {
    const navigate = useNavigate();

    const menuGroups = [
        {
            title: 'SUBSYSTEMS',
            items: [
                { id: 'dashboard', name: 'Dashboard Overview', icon: LayoutDashboard },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 },
                { id: 'users', name: 'User Access', icon: Users }
            ]
        },
        {
            title: 'SITE PAGES',
            items: [
                { id: 'home', name: 'Home Page', icon: Home, path: '/' },
                { id: 'calendar', name: 'Calendar', icon: Calendar, path: '/calendar' },
                { id: 'feedback', name: 'Feedback', icon: MessageSquare, path: '/feedback' },
                { id: 'about', name: 'About Us', icon: Info, path: '/about' },
                { id: 'contact', name: 'Contact', icon: Mail, path: '/contact' }
            ]
        }
    ];

    const handleItemClick = (item) => {
        if (item.path) {
            navigate(item.path);
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
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: '50px',
            left: 0,
            overflowY: 'auto',
            borderRight: 'none',
            zIndex: 100
        }}>
            {/* Logo Area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '30px 20px', paddingBottom: '10px' }}>
                <img src={logo} alt="UniCafé Logo" style={{ height: '40px', width: '40px', objectFit: 'cover', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', backgroundColor: 'white' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'white', letterSpacing: '-0.5px' }}>
                    UniCafe<span style={{ color: '#FFB800' }}>SALES</span>
                </h2>
            </div>

            {/* Navigation Groups */}
            <div style={{ flex: 1, padding: '20px 0' }}>
                {menuGroups.map((group, idx) => (
                    <div key={idx} style={{ marginBottom: '35px' }}>
                        <h3 style={{
                            fontSize: '0.75rem',
                            color: 'rgba(255,255,255,0.5)',
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
            <div style={{ padding: '30px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '15px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default SalesSidebar;
