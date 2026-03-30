import React from 'react';
import { Coffee, Search, User, ShoppingCart, MessageSquare, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/unicafe_logo_orange.png';

const Header = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('username');
        navigate('/login');
        window.location.reload();
    };
    return (
        <header>
            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <img src={logo} alt="UniCafé Logo" style={{ height: '35px', width: '35px', objectFit: 'cover', borderRadius: '50%' }} />
                <h2 style={{ fontWeight: 800, letterSpacing: '-1px', color: 'white', margin: 0, fontSize: '1.3rem' }}>Uni<span style={{ color: 'var(--primary)' }}>Café</span></h2>
            </div>
            <nav style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    {user && (user.role === 'admin' || user.role === 'inventory' || user.role === 'staff') && (
                        <li><Link to={(user.role === 'admin' || user.role === 'staff') ? "/admin" : "/ims"}>Dashboard</Link></li>
                    )}
                    <li><Link to="/about">About</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                    <li><Link to="/order">Ordering</Link></li>
                    <li><Link to="/calendar">Calendar</Link></li>
                    <li><Link to="/feedback">Feedback</Link></li>
                </ul>
            </nav>
            <div className="header-actions" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {user && (user.role === 'admin' || user.role === 'staff') ? (
                    <>
                        <div style={{ position: 'relative', cursor: 'pointer', color: '#D6D0C1' }}>
                            <MessageSquare size={20} />
                            <div style={{ position: 'absolute', top: -8, right: -8, width: '16px', height: '16px', background: 'var(--primary)', borderRadius: '50%', border: '2px solid var(--primary-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: 800 }}>5</div>
                        </div>
                        <div style={{ position: 'relative', cursor: 'pointer', color: '#D6D0C1' }}>
                            <Bell size={20} />
                            <div style={{ position: 'absolute', top: -8, right: -8, width: '16px', height: '16px', background: 'var(--primary)', borderRadius: '50%', border: '2px solid var(--primary-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: 800 }}>3</div>
                        </div>
                    </>
                ) : (
                    <>
                        <Search size={20} style={{ color: '#D6D0C1', cursor: 'pointer' }} />
                        <Link to="/order" style={{ color: '#D6D0C1', display: 'flex', alignItems: 'center' }} title="View Cart">
                            <ShoppingCart size={20} />
                        </Link>
                    </>
                )}
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to={(user.role === 'admin' || user.role === 'staff') ? "/admin" : user.role === 'inventory' ? "/ims" : "/profile"} style={{ textDecoration: 'none', color: '#D6D0C1', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#D6D0C1', fontWeight: 800 }}>
                                    {user.name.charAt(0)}
                                </div>
                                <span>{user.name}</span>
                            </div>
                        </Link>
                        <button onClick={handleLogout} style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', cursor: 'pointer', color: 'var(--primary-black)', background: 'var(--primary)', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'var(--primary-black)', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                            <User size={18} /> Login
                        </button>
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;
