import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Bell, ShoppingBag, Star, History, Trash2, Heart, Mic, MicOff, CheckCircle, Zap
} from 'lucide-react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';

const ItemCard = ({ item, language, addToCart, toggleWishlist, isWishlisted }) => (
    <div 
        style={{ 
            background: '#FFFFFF', 
            borderRadius: '20px', 
            padding: '1.5rem', 
            border: '1px solid #F3F4F6', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            transition: 'transform 0.2s',
            cursor: 'pointer'
        }}
        className="item-card-hover"
    >
        <div style={{ width: '100%', height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
            <img 
                src={item.image} 
                alt={typeof item.name === 'object' ? item.name[language] : item.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} 
            />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1F2937', margin: 0, lineHeight: 1.3 }}>
                {typeof item.name === 'object' ? item.name[language] : item.name}
            </h3>
            <div style={{ display: 'flex', gap: '4px' }}>
                {(item.dietary?.includes('Veg') || item.isVeg) && <div style={{ width: '12px', height: '12px', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Vegetarian"><div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} /></div>}
            </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-red)' }}>LKR {item.price}</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B', fontSize: '0.85rem', fontWeight: 600 }}>
                <Star size={14} fill="#F59E0B" /> 2.5K+
            </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
            <button 
                onClick={(e) => { e.stopPropagation(); toggleWishlist(item); }}
                style={{ width: '48px', height: '48px', flexShrink: 0, padding: 0, background: isWishlisted ? '#FFF1F2' : '#F3F4F6', border: 'none', borderRadius: '12px', color: isWishlisted ? '#E11D48' : '#9CA3AF', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s' }}
                className="wishlist-btn-hover"
                title="Favorite"
            >
                <Heart size={20} fill={isWishlisted ? "#E11D48" : "none"} strokeWidth={isWishlisted ? 0 : 2} />
            </button>

            <button 
                onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                style={{ flex: 1, padding: '0.75rem', background: 'var(--primary-red)', border: 'none', borderRadius: '12px', color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'background 0.2s', boxShadow: '0 4px 10px rgba(218, 41, 28, 0.2)' }}
            >
                Order
            </button>
        </div>
    </div>
);

const OrderingPage = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
    const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('wishlist') || '[]'));
    const [isProcessing, setIsProcessing] = useState(false);
    const [language, setLanguage] = useState('en');
    const [searchQuery, setSearchQuery] = useState('');
    const [dietaryFilter, setDietaryFilter] = useState('All');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [queueData, setQueueData] = useState({ queueLength: 0, estimatedWaitTime: 12 });
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Sync Search from URL
    useEffect(() => {
        const query = searchParams.get('q');
        const categoryParam = searchParams.get('category');
        if (query) {
            setSearchQuery(query);
            setActiveCategory('All');
        } else if (categoryParam) {
            setActiveCategory(categoryParam);
        }
    }, [searchParams]);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        window.dispatchEvent(new Event('cartUpdated'));
    }, [cart, wishlist]);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await axios.get('/api/menu');
                if (response.data && response.data.length > 0) {
                    setMenuItems(response.data);
                } else {
                    setMenuItems(MOCK_DATA);
                }
            } catch (err) {
                setMenuItems(MOCK_DATA);
            }
        };
        fetchMenu();
    }, []);

    const MOCK_DATA = [
        { _id: '1', name: { en: 'Kiribath with Lunu Miris', si: 'ලුණු මිරිස් සමඟ කිරි බත්', ta: 'கிரிபத் உடன் லினு மிரிஸ்' }, price: 150, category: 'Breakfast', isVeg: true, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800' },
        { _id: '3', name: { en: 'Chicken Fried Rice', si: 'චිකන් ෆ්‍රයිඩ් රයිස්', ta: 'சிக்கன் ப்ரைட் ரைஸ்' }, price: 350, category: 'Lunch', isVeg: false, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=800' },
        { _id: '6', name: { en: 'Chicken Kottu', si: 'චිකන් කොත්තු', ta: 'சிக்கன் கொத்து' }, price: 400, category: 'Dinner', isVeg: false, image: 'https://images.unsplash.com/photo-1630409351241-e90f0556557d?auto=format&fit=crop&q=80&w=800' },
        { _id: '9', name: { en: 'Fish Patties', si: 'මාළු පැටිස්', ta: 'மீன் பட்டிஸ்' }, price: 60, category: 'Snacks', isVeg: false, image: 'https://images.unsplash.com/photo-1601702538934-22f4b5f9038d?auto=format&fit=crop&q=80&w=800' },
        { _id: '12', name: { en: 'Milk Tea', si: 'කිරි තේ', ta: 'பால் தேநீர்' }, price: 60, category: 'Beverages', isVeg: true, image: 'https://images.unsplash.com/photo-1594631252845-29fc458695d1?auto=format&fit=crop&q=80&w=800' }
    ];

    useEffect(() => {
        if ('window' in globalThis && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.onresult = (e) => {
                const transcript = e.results[e.results.length - 1][0].transcript.toLowerCase();
                setSearchQuery(transcript);
            };
        }
    }, []);

    const toggleListening = () => {
        if (isListening) recognitionRef.current?.stop();
        else recognitionRef.current?.start();
        setIsListening(!isListening);
    };

    const categories = [
        { name: 'All', icon: '🍱', displayName: 'All' },
        { name: 'Special Menu', icon: '🌟', displayName: 'Special Menu' },
        { name: 'Breakfast', icon: '🍳', displayName: 'Breakfast' },
        { name: 'Lunch', icon: '🍛', displayName: 'Lunch' },
        { name: 'Dinner', icon: '🍲', displayName: 'Dinner' },
        { name: 'Snacks', icon: '🥟', displayName: 'Snacks' },
        { name: 'Beverages', icon: '🥤', displayName: 'Beverages' }
    ];

    const addToCart = (item) => {
        const existing = cart.find(i => i._id === item._id);
        if (existing) {
            setCart(cart.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const toggleWishlist = (item) => {
        if (wishlist.find(i => i._id === item._id)) {
            setWishlist(wishlist.filter(i => i._id !== item._id));
        } else {
            setWishlist([...wishlist, item]);
        }
    };

    const removeFromCart = (id) => setCart(cart.filter(i => i._id !== id));

    const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subTotal > 0 ? 50 : 0;
    const cartTotal = subTotal + tax;

    const handlePlaceOrder = async () => {
        if (!user.email && !localStorage.getItem('username')) {
            alert('Please login first');
            navigate('/login');
            return;
        }
        setIsProcessing(true);
        try {
            const res = await axios.post('/api/orders', {
                username: user.username || localStorage.getItem('username'),
                items: cart.map(i => ({ name: i.name[language], quantity: i.quantity, price: i.price })),
                totalAmount: cartTotal
            });
            setCart([]);
            navigate(`/order-success/${res.data._id}`);
        } catch (err) {
            alert('Failed to place order');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', background: '#F8F9FA', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ display: 'flex', flex: 1, width: '100%', flexWrap: 'nowrap' }}>
                {/* --- MAIN CONTENT --- */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F9FAFB', minWidth: 0 }}>
                    {/* Top Search Bar */}
                    <div style={{ padding: '1.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(249, 250, 251, 0.9)', backdropFilter: 'blur(10px)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', width: '400px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '0.5rem 1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <Search size={18} color="#9CA3AF" />
                                    <input 
                                        type="text" 
                                        placeholder="Search food (Press Enter to search)" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.target.blur();
                                                document.getElementById('items-grid-start')?.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }}
                                        style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '0.5rem', width: '100%', fontSize: '0.9rem' }} 
                                    />
                                    <button 
                                        onClick={toggleListening} 
                                        style={{ 
                                            background: 'transparent', 
                                            border: 'none', 
                                            cursor: 'pointer', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            padding: '0.2rem',
                                            marginLeft: '0.5rem',
                                            borderRadius: '8px',
                                            transition: 'background 0.2s'
                                        }}
                                        className="voice-search-btn"
                                    >
                                        {isListening ? <Mic size={18} color="#EF4444" className="pulse-animation" /> : <MicOff size={18} color="#9CA3AF" />}
                                    </button>
                                </div>
                            {searchQuery && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--coffee-muted)' }}>
                                    Showing results for "{searchQuery}"
                                </motion.div>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <LanguageSelector currentLang={language} onLanguageChange={setLanguage} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <img src={user.picture || 'https://ui-avatars.com/api/?name=User'} alt="Me" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name || 'Guest'}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '0 2.5rem 2.5rem 2.5rem' }}>
                        {/* Explore Categories & Search Results Header */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            {!searchQuery ? (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
                                        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--coffee-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            Explore Menu
                                            <span style={{ fontSize: '0.8rem', color: 'var(--latte-highlight)', background: 'rgba(201, 147, 90, 0.1)', padding: '0.2rem 0.7rem', borderRadius: '99px', fontWeight: 700 }}>{menuItems.length} Selection</span>
                                        </h1>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: 'var(--primary-red)', fontWeight: 700, background: 'rgba(255, 199, 44, 0.1)', padding: '0.4rem 1rem', borderRadius: '10px', border: '1px solid rgba(255, 199, 44, 0.3)' }}>
                                            <Zap size={14} fill="var(--primary-red)" /> {queueData.estimatedWaitTime} min wait time
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }} className="hide-scrollbar">
                                        {categories.map((cat, idx) => (
                                            <motion.div 
                                                key={idx} 
                                                onClick={() => setActiveCategory(cat.name)}
                                                whileHover={{ y: -4, scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.85rem',
                                                    padding: '0.9rem 1.5rem',
                                                    background: activeCategory === cat.name ? 'var(--coffee-dark)' : '#FFFFFF',
                                                    border: activeCategory === cat.name ? 'none' : '1px solid var(--latte-border)',
                                                    borderRadius: '16px',
                                                    cursor: 'pointer',
                                                    minWidth: 'max-content',
                                                    transition: 'background 0.3s, box-shadow 0.3s',
                                                    boxShadow: activeCategory === cat.name ? '0 10px 20px rgba(81, 43, 21, 0.2)' : '0 4px 10px rgba(0,0,0,0.02)',
                                                    color: activeCategory === cat.name ? '#FFFFFF' : 'var(--coffee-muted)'
                                                }}
                                            >
                                                <span style={{ fontSize: '1.75rem', filter: activeCategory === cat.name ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none' }}>{cat.icon}</span>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.1 }}>
                                                        {cat.displayName}
                                                    </span>
                                                    {activeCategory === cat.name && (
                                                        <motion.div layoutId="active-indicator" style={{ height: '2px', background: 'var(--latte-highlight)', width: '60%', marginTop: '4px', borderRadius: '2px' }} />
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--latte-border)' }}>
                                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--coffee-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        Search Results
                                        <span style={{ fontSize: '0.8rem', color: 'var(--latte-highlight)', background: 'rgba(201, 147, 90, 0.1)', padding: '0.2rem 0.7rem', borderRadius: '99px', fontWeight: 700 }}>Results for "{searchQuery}"</span>
                                    </h1>
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        style={{ 
                                            background: '#FFFFFF', 
                                            border: '1px solid #E5E7EB', 
                                            padding: '0.6rem 1.25rem', 
                                            borderRadius: '10px', 
                                            fontSize: '0.9rem', 
                                            fontWeight: 700, 
                                            color: '#6B7280', 
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <Trash2 size={16} /> Back to Menu
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Items Grid */}
                        <div id="items-grid-start">
                            {searchQuery ? (() => {
                                const query = searchQuery.toLowerCase();
                                const allMatches = menuItems.filter(i => {
                                    const name = i.name;
                                    if (typeof name === 'object') {
                                        return (name.en?.toLowerCase().includes(query) || 
                                                name.si?.toLowerCase().includes(query) || 
                                                name.ta?.toLowerCase().includes(query));
                                    }
                                    return String(name || '').toLowerCase().includes(query);
                                });

                                if (allMatches.length === 0) {
                                    return (
                                        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '24px', border: '1px dashed #E5E7EB' }}>
                                            <Search size={48} color="#9CA3AF" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                                            <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>No matching items found</h3>
                                            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Try searching with a different keyword or check your spelling.</p>
                                        </div>
                                    );
                                }

                                // Group matches by category
                                const grouped = allMatches.reduce((acc, item) => {
                                    const itemCats = Array.isArray(item.category) ? item.category : [item.category || 'Other'];
                                    itemCats.forEach(cat => {
                                        if (!acc[cat]) acc[cat] = [];
                                        acc[cat].push(item);
                                    });
                                    return acc;
                                }, {});

                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                        {Object.entries(grouped).map(([category, items]) => (
                                            <div key={category}>
                                                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--coffee-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{category}</h2>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                                    {items.map(i => (
                                                        <ItemCard 
                                                            key={i._id} 
                                                            item={i} 
                                                            language={language} 
                                                            addToCart={addToCart} 
                                                            toggleWishlist={toggleWishlist} 
                                                            isWishlisted={wishlist.some(wItem => wItem._id === i._id)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })() : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                    {menuItems.filter(i => 
                                        activeCategory === 'All' || 
                                        (Array.isArray(i.category) ? i.category.includes(activeCategory) : i.category === activeCategory)
                                    ).map(i => (
                                        <ItemCard key={i._id} item={i} language={language} addToCart={addToCart} toggleWishlist={toggleWishlist} isWishlisted={wishlist.some(wItem => wItem._id === i._id)} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- SIDEBAR INVOICE --- */}
                <div style={{ 
                    width: '350px', 
                    flexShrink: 0, 
                    background: 'white', 
                    borderLeft: '1px solid #E5E7EB', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100vh', 
                    position: 'sticky', 
                    top: 0 
                }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>Invoice</h2>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>UniCafe Order</div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }} className="custom-scrollbar">
                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#9CA3AF', marginTop: '3rem' }}>
                                <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>Empty Basket</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item._id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' }}>
                                    <img src={item.image} alt="food" style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>
                                            {typeof item.name === 'object' ? item.name[language] : item.name}
                                        </div>
                                        <div style={{ color: 'var(--primary-red)', fontWeight: 700, fontSize: '0.85rem' }}>LKR {item.price} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>x {item.quantity}</span></div>
                                    </div>
                                    <Trash2 size={16} color="#EF4444" cursor="pointer" onClick={() => removeFromCart(item._id)} />
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{ padding: '1.5rem', background: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <span color="#6B7280">Subtotal</span>
                                <span style={{ fontWeight: 600 }}>LKR {subTotal}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span color="#6B7280">Tax</span>
                                <span style={{ fontWeight: 600 }}>LKR {tax}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem', color: '#1F2937' }}>
                            <span>Total</span>
                            <span>LKR {cartTotal}</span>
                        </div>
                        <button 
                            onClick={handlePlaceOrder}
                            disabled={cart.length === 0 || isProcessing}
                            style={{ 
                                width: '100%', padding: '1rem', background: 'var(--primary-red)', color: 'white', 
                                border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                                opacity: (cart.length === 0 || isProcessing) ? 0.6 : 1
                            }}
                        >
                            {isProcessing ? 'Processing...' : 'Place Order Now'}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; borderRadius: 4px; }
                .item-card-hover:hover { transform: translateY(-4px); }
            `}</style>
        </div>
    );
};

export default OrderingPage;
