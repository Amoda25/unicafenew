import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Utensils, Heart, ShoppingBag, Coffee, Pizza, Navigation, ArrowRight } from 'lucide-react';
import heroBurger from '../assets/hero_burger.png';
import stringHoppers from '../assets/string_hoppers.jpg';
import milkshake from '../assets/milkshake.png';
import sandwichImg from '../assets/sandwich.png';
import pastaImg from '../assets/pasta.png';

const HomePage = () => {


    const categories = [
        { name: 'Pizza', count: '14', img: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop' },
        { name: 'Broast', count: '4', img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop' },
        { name: 'Chicken', count: '5', img: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=800&auto=format&fit=crop' },
        { name: 'Burgers', count: '19', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop' },
        { name: 'Shakes', count: '22', img: milkshake },
        { name: 'Sandwiches', count: '6', img: sandwichImg },
        { name: 'Pasta', count: '10', img: pastaImg },
        { name: 'Desserts', count: '15', img: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&auto=format&fit=crop' }
    ];

    const popularIcons = [
        { bg: '#E2F0CB', icon: <Utensils color="#000" size={20} /> },
        { bg: '#FFDFD3', icon: <Heart color="#000" size={20} /> },
        { bg: '#FEC8D8', icon: <ShoppingBag color="#000" size={20} /> },
        { bg: '#D0F4DE', icon: <Coffee color="#000" size={20} /> },
        { bg: '#A9DEF9', icon: <Pizza color="#000" size={20} /> },
        { bg: '#FDE4CF', icon: <Navigation color="#000" size={20} /> }
    ];

    return (
        <div style={{ backgroundColor: '#F9F9F9', minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* HERO SECTION */}
            <section style={{
                position: 'relative',
                backgroundColor: '#0F1215',
                overflow: 'hidden',
                marginTop: '-40px',
                paddingTop: '40px'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '6rem 20px 14rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '4rem',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <div style={{ flex: '1 1 500px' }}>
                        {/* Badge */}
                        <div style={{
                            display: 'table',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '50px',
                            padding: '8px 16px',
                            color: 'var(--primary)',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            marginBottom: '1.5rem'
                        }}>
                            Easy way to order your food 🛵
                        </div>
                        
                        <h1 style={{
                            color: 'white',
                            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                            fontWeight: 900,
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            letterSpacing: '-1px'
                        }}>
                            Experience the Best<br />Campus Dining
                        </h1>
                        
                        <p style={{
                            color: '#A0AAB2',
                            fontSize: '1.1rem',
                            lineHeight: 1.6,
                            marginBottom: '2.5rem',
                            maxWidth: '480px'
                        }}>
                            Enjoy delicious, freshly prepared meals that fuel your studies and satisfy your cravings. Your ultimate destination for multi-cuisine dining right on campus.
                        </p>

                        {/* Order Now Button */}
                        <div style={{ marginBottom: '3rem' }}>
                            <Link to="/order" className="btn-premium" style={{ 
                                textDecoration: 'none', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.8rem',
                                padding: '1rem 2.5rem',
                                fontSize: '1.1rem',
                                boxShadow: '0 10px 25px rgba(255, 199, 44, 0.4)'
                            }}>
                                Order Now
                                <ArrowRight size={20} />
                            </Link>
                        </div>

                        {/* Popular Restaurant Small Icons */}
                        <div>
                            <div style={{ color: 'white', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                                Popular Restaurant
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {popularIcons.map((item, i) => (
                                    <div key={i} style={{
                                        width: '45px',
                                        height: '45px',
                                        background: item.bg,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {item.icon}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Hero Image overlapping dark section */}
                <div style={{
                    position: 'absolute',
                    top: '0',
                    right: '0%',
                    width: '65%',
                    height: '100%',
                    background: `url(${heroBurger}) right 65% / cover no-repeat`,
                    maskImage: 'linear-gradient(to right, transparent, black 30%)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 30%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }} />

                {/* Bottom White Curve SVG */}
                <svg 
                    style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', zIndex: 2, display: 'block' }}
                    viewBox="0 0 1440 120" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                >
                    <path d="M0,80 C320,160 1120,0 1440,80 L1440,120 L0,120 Z" fill="#F9F9F9"/>
                </svg>
            </section>

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
                    {[
                        { title: 'Study Session Combo', desc: 'Perfect coffee & snacks to keep you focused during exam weeks.', price: 'Rs. 450', img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&auto=format&fit=crop' },
                        { title: 'Hostel Night Special', desc: 'A large pizza meant to be split with your roommates.', price: 'Rs. 2200', img: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&auto=format&fit=crop' },
                        { title: 'Morning Lecture Boost', desc: 'Fresh juice and light breakfast to start your uni day right.', price: 'Rs. 300', img: stringHoppers }
                    ].map((item, i) => (
                        <motion.div 
                            key={i}
                            whileHover={{ y: -10 }}
                            style={{
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: '0 15px 35px rgba(0,0,0,0.06)',
                                cursor: 'pointer',
                                position: 'relative'
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
                                    fontWeight: 'bold',
                                    color: 'black',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                                }}>
                                    {item.price}
                                </div>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'white', textAlign: 'left' }}>
                                <div style={{ marginBottom: '10px' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937' }}>{item.title}</h3>
                                </div>
                                <p style={{ color: '#6B7280', fontSize: '0.95rem', lineHeight: 1.5 }}>
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
