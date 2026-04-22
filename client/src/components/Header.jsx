import React from 'react';
import { Coffee, Search, User, ShoppingCart, MessageSquare, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

import logo from '../assets/unicafe_logo_vintage.png';

const Header = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    const [isSearchActive, setIsSearchActive] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [cartCount, setCartCount] = React.useState(0);

    const updateCartCount = () => {
        try {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            setCartCount(count);
        } catch (err) {
            console.error('Error updating cart count:', err);
        }
    };

    React.useEffect(() => {
        if (user) {
            fetchUnreadCount();
            updateCartCount();
            window.addEventListener('cartUpdated', updateCartCount);
            window.addEventListener('storage', updateCartCount);
            const interval = setInterval(() => {
                fetchUnreadCount();
                updateCartCount();
            }, 30000);
            return () => {
                window.removeEventListener('cartUpdated', updateCartCount);
                window.removeEventListener('storage', updateCartCount);
                clearInterval(interval);
            };
        }
    }, [user?.username]);

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get(`/api/notifications/${user.username}/unread-count`);
            setUnreadCount(response.data.count);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('username');
        navigate('/');
        window.location.reload();
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const query = searchQuery.trim().toLowerCase();
        if (!query) return;

        const routeMap = {
            'home': '/', 'main': '/', 'menu': '/order', 'order': '/order',
            'food': '/order', 'buy': '/order', 'profile': '/profile',
            'account': '/profile', 'user': '/profile', 'me': '/profile',
            'cart': '/cart', 'basket': '/cart', 'checkout': '/cart',
            'about': '/about', 'contact': '/contact', 'support': '/contact',
            'help': '/contact', 'calendar': '/calendar', 'schedule': '/calendar',
            'feedback': '/feedback', 'review': '/feedback',
            'notifications': '/notifications', 'alerts': '/notifications',
            'bell': '/notifications', 'admin': '/admin', 'dashboard': '/admin',
            'ims': '/ims', 'inventory': '/ims', 'stock': '/ims',
            'orders list': '/orders', 'queue': '/orders', 'sales': '/sales',
            'revenue': '/sales', 'menu admin': '/menu-admin',
            'feedback admin': '/feedback-admin'
        };

        if (routeMap[query]) {
            navigate(routeMap[query]);
        } else {
            navigate(`/order?q=${encodeURIComponent(query)}`);
        }

        setIsSearchActive(false);
        setSearchQuery('');
    };

    return (
        <header>
            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <img src={logo} alt="UniCafé Logo" style={{ height: '42px', objectFit: 'contain' }} />
                <h2 style={{ fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--coffee-dark)', margin: 0, fontSize: '1.25rem', textTransform: 'uppercase' }}>
                    Uni<span style={{ color: 'var(--latte-highlight)' }}>Café</span>
                </h2>
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
                        <div onClick={() => navigate('/notifications')} style={{ position: 'relative', cursor: 'pointer', color: 'var(--coffee-muted)' }}>
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <div style={{ position: 'absolute', top: -8, right: -8, width: '16px', height: '16px', background: 'var(--coffee-dark)', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: 800 }}>
                                    {unreadCount}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
                                <motion.div
                                    initial={false}
                                    animate={{ width: isSearchActive ? '200px' : '0px', opacity: isSearchActive ? 1 : 0 }}
                                    style={{ overflow: 'hidden', display: 'flex', alignItems: 'center' }}
                                >
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search UniCafé..."
                                        style={{
                                            padding: '8px 15px',
                                            borderRadius: '20px',
                                            border: '1px solid var(--latte-border)',
                                            background: '#fcfaf7',
                                            fontSize: '0.85rem',
                                            outline: 'none',
                                            marginRight: '10px',
                                            width: '100%',
                                            color: 'var(--coffee-dark)',
                                            fontWeight: 600
                                        }}
                                        autoFocus={isSearchActive}
                                    />
                                </motion.div>
                                <Search
                                    size={20}
                                    style={{ color: 'var(--coffee-muted)', cursor: 'pointer', transition: 'transform 0.2s' }}
                                    onClick={() => isSearchActive ? handleSearchSubmit({ preventDefault: () => {} }) : setIsSearchActive(true)}
                                    className="search-icon-hover"
                                />
                            </form>
                        </div>
                        {user && (
                            <div onClick={() => navigate('/notifications')} style={{ position: 'relative', cursor: 'pointer', color: 'var(--coffee-muted)' }}>
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <div style={{ position: 'absolute', top: -8, right: -8, width: '16px', height: '16px', background: 'var(--coffee-dark)', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: 800 }}>
                                        {unreadCount}
                                    </div>
                                )}
                            </div>
                        )}
                        <Link to="/cart" style={{ position: 'relative', color: 'var(--coffee-muted)', display: 'flex', alignItems: 'center' }} title="View Cart">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && (
                                <div style={{ position: 'absolute', top: -8, right: -8, width: '16px', height: '16px', background: 'var(--latte-highlight)', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: 800 }}>
                                    {cartCount}
                                </div>
                            )}
                        </Link>
                    </>
                )}

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to={(user.role === 'admin' || user.role === 'staff') ? "/admin" : user.role === 'inventory' ? "/ims" : "/profile"} style={{ textDecoration: 'none', color: 'var(--navbar-text)', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--latte-highlight) 0%, var(--coffee-dark) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#fff', fontWeight: 800 }}>
                                    {user.name.charAt(0)}
                                </div>
                                <span style={{ color: 'var(--coffee-dark)' }}>{user.name}</span>
                            </div>
                        </Link>
                        <button onClick={handleLogout} style={{ padding: '0.5rem 1.4rem', fontSize: '0.85rem', cursor: 'pointer', color: '#fff', background: 'var(--coffee-dark)', border: 'none', borderRadius: '50px', fontWeight: 700, boxShadow: '0 3px 10px rgba(59,31,14,0.25)', transition: 'all 0.25s' }}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--coffee-dark)', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '50px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 3px 12px rgba(59,31,14,0.25)', transition: 'all 0.25s' }}>
                            <User size={16} /> Order Now
                        </button>
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;
