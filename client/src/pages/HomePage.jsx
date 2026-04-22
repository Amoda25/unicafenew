import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Utensils, Heart, ShoppingBag, Coffee, Pizza, Navigation, ArrowRight, Image as ImageIcon, Zap, Clock, Tag } from 'lucide-react';
import axios from 'axios';
import heroFood from '../assets/hero_food_new.png';
import stringHoppers from '../assets/string_hoppers.jpg';
import milkshake from '../assets/milkshake.png';
import sandwichImg from '../assets/sandwich.png';
import pastaImg from '../assets/pasta.png';
import campusBg from '../assets/campus_bg.png';

const HomePage = () => {
    const navigate = useNavigate();
    const [specialItems, setSpecialItems] = useState([]);
    const [flashDeals, setFlashDeals] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState({});
    const user = JSON.parse(localStorage.getItem('user'));

    const categories = [
        { name: 'Special Menu', count: 'Exclusive', img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop' },
        { name: 'Pizza', count: '14', img: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop' },
        { name: 'Broast', count: '4', img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop' },
        { name: 'Chicken', count: '5', img: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=800&auto=format&fit=crop' },
        { name: 'Burgers', count: '19', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop' },
        { name: 'Shakes', count: '22', img: milkshake },
        { name: 'Sandwiches', count: '6', img: sandwichImg },
        { name: 'Pasta', count: '10', img: pastaImg },
        { name: 'Special Menu', count: 'New', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop' },
        { name: 'Desserts', count: '15', img: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&auto=format&fit=crop' }
    ];

    useEffect(() => {
        const fetchSpecialItems = async () => {
            try {
                const res = await axios.get('/api/menu');
                const filtered = res.data.filter(item => 
                    item.category && 
                    (Array.isArray(item.category) 
                        ? item.category.includes('Special Menu') 
                        : item.category === 'Special Menu')
                );
                setSpecialItems(filtered.slice(0, 3));
            } catch (err) {
                console.error('Error fetching special items:', err);
            }
        };

        const fetchFlashDeals = async () => {
            try {
                const res = await axios.get('/api/flash-deals');
                setFlashDeals(res.data);
            } catch (err) {
                console.error('Error fetching flash deals:', err);
            }
        };

        fetchSpecialItems();
        fetchFlashDeals();
    }, []);

    // Countdown Timer Logic
    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeRemaining = {};
            flashDeals.forEach(deal => {
                const expiry = new Date(deal.expiresAt).getTime();
                const now = new Date().getTime();
                const diff = expiry - now;

                if (diff > 0) {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    newTimeRemaining[deal._id] = `${hours}h ${minutes}m ${seconds}s`;
                } else {
                    newTimeRemaining[deal._id] = 'Expired';
                }
            });
            setTimeRemaining(newTimeRemaining);
        }, 1000);

        return () => clearInterval(timer);
    }, [flashDeals]);

    const handleCategoryClick = (name) => {
        navigate(`/order?category=${encodeURIComponent(name)}`);
    };

    // Prepare favorites list (dynamic specials + fallbacks)
    const fallbacks = [
        { title: 'Study Session Combo', desc: 'Perfect coffee & snacks to keep you focused during exam weeks.', price: 'Rs. 450', img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&auto=format&fit=crop' },
        { title: 'Hostel Night Special', desc: 'A large pizza meant to be split with your roommates.', price: 'Rs. 2200', img: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&auto=format&fit=crop' },
        { title: 'Morning Lecture Boost', desc: 'Fresh juice and light breakfast to start your uni day right.', price: 'Rs. 300', img: stringHoppers }
    ];

    const dynamicFavorites = specialItems.map(item => ({
        title: item.name.en,
        desc: item.description?.en || 'Premium special item from UniCafé hub.',
        price: `Rs. ${item.price}`,
        img: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop',
        isReal: true,
        id: item._id
    }));

    // Fill with fallbacks if less than 3
    const finalFavorites = [...dynamicFavorites, ...fallbacks].slice(0, 3);
    return (
        <div style={{ backgroundColor: '#F9F9F9', minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* HERO SECTION - Full Width Redesign */}
            <section style={{
                width: '100%',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                background: 'linear-gradient(to right, rgba(20, 15, 10, 0.9) 0%, rgba(20, 15, 10, 0.5) 50%, rgba(20, 15, 10, 0.1) 100%), url("https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&auto=format&fit=crop")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                position: 'relative',
                overflow: 'hidden',
                padding: '60px 8%'
            }}>
                <div style={{ width: '100%', maxWidth: '1300px', margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ maxWidth: '650px', position: 'relative', zIndex: 10 }}
                    >
                        {/* Pill/Tag */}
                        <div style={{
                            display: 'inline-block',
                            background: 'rgba(210, 180, 140, 0.2)',
                            backdropFilter: 'blur(10px)',
                            padding: '8px 20px',
                            borderRadius: '50px',
                            color: '#eaddcf',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            marginBottom: '20px',
                            border: '1px solid rgba(210, 180, 140, 0.3)',
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                        }}>
                            Premium Dining
                        </div>
                        
                        {/* Title */}
                        <h1 style={{
                            color: '#ffffff',
                            fontFamily: '"Outfit", sans-serif',
                            fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                            fontWeight: 800,
                            lineHeight: 1.1,
                            marginBottom: '20px',
                            letterSpacing: '-1px',
                            textShadow: '0 4px 20px rgba(0,0,0,0.3)'
                        }}>
                            Welcome to Your<br />
                            University Dining<br/>Experience
                        </h1>
                        
                        {/* Description */}
                        <p style={{
                            color: 'rgba(255, 255, 255, 0.85)',
                            fontSize: '1.1rem',
                            lineHeight: 1.6,
                            marginBottom: '40px',
                            fontWeight: 400,
                            maxWidth: '480px'
                        }}>
                            UniCafe brings together online ordering, fresh meals, and a seamless digital experience. 
                            Skip the line and enjoy your favorite campus food, brewed fresh and served warm.
                        </p>

                        {/* Button */}
                        <Link to="/order" style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#ffffff',
                            color: '#2d1e12',
                            textDecoration: 'none', 
                            padding: '16px 45px',
                            borderRadius: '50px',
                            fontSize: '1rem',
                            fontWeight: '700',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease'
                        }} 
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = '#f8f0e6'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#ffffff'; }}
                        >
                            Visit us
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* FLASH DEALS SECTION — visible only when logged in & deals are active */}
            {user && flashDeals.length > 0 && (
                <section style={{ maxWidth: '1200px', margin: '3rem auto 0', padding: '0 20px' }}>
                    {/* Section Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '14px',
                                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 6px 16px rgba(239,68,68,0.3)',
                                animation: 'pulse 2s infinite'
                            }}>
                                <Zap size={22} color="white" fill="white" />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', letterSpacing: '1px', textTransform: 'uppercase' }}>Limited Time</div>
                                <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#1F2937' }}>⚡ Flash Deals</h2>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                            <Clock size={14} />
                            Expires in 24h
                        </div>
                    </div>

                    {/* Deal Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                        {flashDeals.map((deal, i) => (
                            <motion.div
                                key={deal._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(239,68,68,0.15)' }}
                                onClick={() => navigate(`/order?q=${encodeURIComponent(deal.itemName)}`)}
                                style={{
                                    borderRadius: '20px',
                                    background: 'white',
                                    border: '1.5px solid #fecaca',
                                    padding: '22px',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 20px rgba(239,68,68,0.06)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {/* Discount Badge */}
                                <div style={{
                                    position: 'absolute', top: '14px', right: '14px',
                                    background: 'linear-gradient(135deg, #ef4444, #f97316)',
                                    color: 'white', fontWeight: 900, fontSize: '0.9rem',
                                    padding: '4px 12px', borderRadius: '20px',
                                    boxShadow: '0 4px 10px rgba(239,68,68,0.35)'
                                }}>
                                    {deal.discountPct}% OFF
                                </div>

                                {/* Flash icon background */}
                                <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.04 }}>
                                    <Zap size={100} color="#ef4444" fill="#ef4444" />
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                                        <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Flash Sale Active</span>
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1F2937', paddingRight: '70px' }}>{deal.itemName}</h3>
                                </div>

                                <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.5 }}>
                                    {deal.suggestion}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#ef4444', fontWeight: 800 }}>
                                        <Clock size={16} />
                                        Expiring in: {timeRemaining[deal._id] || 'Loading...'}
                                    </div>
                                    <div style={{
                                        padding: '7px 14px', borderRadius: '10px',
                                        background: 'linear-gradient(135deg, #ef4444, #f97316)',
                                        color: 'white', fontWeight: 700, fontSize: '0.78rem',
                                        display: 'flex', alignItems: 'center', gap: '5px'
                                    }}>
                                        <Zap size={12} fill="white" /> Order Now
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, #e5e7eb, transparent)', margin: '3rem 0 0' }} />
                </section>
            )}

            {/* TOP FOODS CATEGORIES */}
            <section style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 20px', textAlign: 'center' }}>
                <div style={{ marginBottom: '4rem' }}>
                    <div style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                        TOP FOODS
                    </div>
                    <h2 style={{ color: '#1F2937', fontSize: '2.5rem', fontWeight: 900, marginBottom: '15px' }}>
                        Our Categories
                    </h2>
                    <div style={{ width: '40px', height: '3px', background: 'var(--primary)', margin: '0 auto' }}></div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '3rem 2rem'
                }}>
                    {categories.map((cat, i) => (
                        <motion.div 
                            key={i}
                            whileHover={{ y: -5 }}
                            onClick={() => handleCategoryClick(cat.name)}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                        >
                            <div style={{
                                width: '160px',
                                height: '160px',
                                borderRadius: '50%',
                                padding: '10px',
                                background: 'white',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                                marginBottom: '1.2rem',
                                transition: 'transform 0.3s',
                            }}>
                                <img 
                                    src={cat.img} 
                                    alt={cat.name} 
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        borderRadius: '50%', 
                                        objectFit: 'cover' 
                                    }} 
                                />
                            </div>
                            <h3 style={{ color: '#1F2937', fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px' }}>
                                {cat.name}
                            </h3>
                            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                                {cat.count} Restaurants Products
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CAMPUS FAVORITES */}
            <section style={{ maxWidth: '1200px', margin: '6rem auto 2rem', padding: '0 20px', textAlign: 'center' }}>
                <div style={{ marginBottom: '4rem' }}>
                    <div style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                        CAMPUS HIGHLIGHTS
                    </div>
                    <h2 style={{ color: '#1F2937', fontSize: '2.5rem', fontWeight: 900, marginBottom: '15px' }}>
                        Student Favorites
                    </h2>
                    <div style={{ width: '40px', height: '3px', background: 'var(--primary)', margin: '0 auto' }}></div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '2rem'
                }}>
                    {finalFavorites.map((item, i) => (
                        <motion.div 
                            key={i}
                            whileHover={{ y: -10 }}
                            onClick={() => {
                                if (item.isReal || item.title.toLowerCase().includes('special')) {
                                    navigate('/order?category=Special%20Menu');
                                } else {
                                    navigate(`/order?q=${encodeURIComponent(item.title)}`);
                                }
                            }}
                            style={{
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: '0 15px 35px rgba(0,0,0,0.06)',
                                cursor: 'pointer',
                                position: 'relative',
                                background: 'white'
                            }}
                        >
                            <div style={{ height: '300px', position: 'relative' }}>
                                <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{
                                    position: 'absolute',
                                    top: '15px',
                                    right: '15px',
                                    background: 'var(--primary)',
                                    borderRadius: '50px',
                                    padding: '6px 12px',
                                    fontWeight: 800,
                                    color: 'black',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                    fontSize: '0.9rem'
                                }}>
                                    {item.price}
                                </div>
                                {item.isReal && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '15px',
                                        left: '15px',
                                        background: 'rgba(0,0,0,0.6)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '50px',
                                        padding: '6px 12px',
                                        fontWeight: 700,
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <Star size={12} fill="#FFD700" color="#FFD700" /> SPECIAL
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '1.5rem', textAlign: 'left' }}>
                                <div style={{ marginBottom: '10px' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937' }}>{item.title}</h3>
                                </div>
                                <p style={{ color: '#6B7280', fontSize: '0.95rem', lineHeight: 1.5, height: '4.5em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                    {item.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
