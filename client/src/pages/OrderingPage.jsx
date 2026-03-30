import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Bell, LayoutDashboard, ShoppingBag, Star, MessageSquare, History, CreditCard, Settings,
    Plus, Minus, Trash2, Heart, Mic, MicOff, CheckCircle, Zap
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';

const OrderingPage = () => {
    const [activeCategory, setActiveCategory] = useState('Breakfast');
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [isOrdered, setIsOrdered] = useState(false);
    const [language, setLanguage] = useState('en');
    const [searchQuery, setSearchQuery] = useState('');
    const [dietaryFilter, setDietaryFilter] = useState('All'); // 'All', 'Veg', 'Non-Veg'
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    // Queue States
    const [queueData, setQueueData] = useState({ queueLength: 0, estimatedWaitTime: 12 });

    // Voice States
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    // Form States
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [username, setUsername] = useState(user.username || localStorage.getItem('username') || '');

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await axios.get('/api/menu');
                if (response.data.length > 0) {
                    setMenuItems(response.data);
                } else {
                    useMockData();
                }
            } catch (err) {
                console.error('Error fetching menu, using fallback:', err);
                useMockData();
            }
        };

        const useMockData = () => {
            setMenuItems([
                // Breakfast
                { _id: '1', name: { en: 'Kiribath with Lunu Miris', si: 'ලුණු මිරිස් සමඟ කිරි බත්', ta: 'கிரிபத் உடன் லினு மிரிஸ்' }, description: { en: 'Traditional Sri Lankan Milk Rice with spicy onion relish', si: 'ලුණු මිරිස් පමණක් එක් කළ රසවත් සාම්ප්‍රදායික කිරි බත්', ta: 'பாரம்பரிய இலங்கை பால் சோறு காரமான வெங்காய சட்னியுடன்' }, price: 150, category: 'Breakfast', isVeg: true, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800' },
                { _id: '2', name: { en: 'String Hoppers (10 Pcs)', si: 'ඉඳි ආප්ප ', ta: 'இடியப்பம்' }, description: { en: 'Served with kiri hodi and pol sambol', si: 'කිරි හොදි සහ පොල් සම්බෝල සමඟ උණුසුම් ඉඳි ආප්ප', ta: 'பாற் கறி மற்றும் சம்பலுடன் சூடான இடியப்பம்' }, price: 120, category: 'Breakfast', isVeg: true, image: 'https://images.unsplash.com/photo-1634509170246-13a6962f3a69?auto=format&fit=crop&q=80&w=800' },
                { _id: '2b', name: { en: 'Pol Roti with Lunu Miris', si: 'පොල් රොටි', ta: 'பொல் ரொட்டி' }, description: { en: 'Warm coconut flatbread served with spicy lunu miris', si: 'රසවත් පොල් රොටි සහ ලුණු මිරිස්', ta: 'சுவையான தேங்காய் ரொட்டி மற்றும் லினு மிரிஸ்' }, price: 80, category: 'Breakfast', isVeg: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800' },

                // Lunch
                { _id: '3', name: { en: 'Chicken Fried Rice', si: 'චිකන් ෆ්‍රයිඩ් රයිස්', ta: 'சிக்கன் ப்ரைட் ரைஸ்' }, description: { en: 'Wok-tossed rice with savory chicken and veggies', si: 'එළවළු සහ කුකුළු මස් එක් කළ රසවත් ෆ්‍රයිඩ් රයිස්', ta: 'சுவையான கோழி மற்றும் காய்கறிகளுடன் பொரித்த சோறு' }, price: 350, category: 'Lunch', isVeg: false, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=800' },
                { _id: '4', name: { en: 'Rice & Curry (Veg)', si: 'බත් සහ එළවළු කරි', ta: 'சோறு மற்றும் மரக்கறி' }, description: { en: 'Authentic Sri Lankan rice with 3 vegetable curries, papadam', si: 'සුදු බත් සමඟ එළවළු කරි 3ක් සහ පපඩම්', ta: '3 காய்கறி கறிகள் மற்றும் பாப்பட் உடன் உண்மையான இலங்கை சோறு' }, price: 200, category: 'Lunch', isVeg: true, image: 'https://images.unsplash.com/photo-1548869206-9ab540b61678?auto=format&fit=crop&q=80&w=800' },
                { _id: '5', name: { en: 'Yellow Rice with Chicken', si: 'කහ බත් සහ චිකන්', ta: 'மஞ்சள் சோறு மற்றும் சிக்கன்' }, description: { en: 'Fragrant yellow rice served with chicken curry, eggplant moju', si: 'කහ බත්, චිකන් කරි සහ වම්බටු මෝජු', ta: 'நறுமண மஞ்சள் சோறு கோழி கறி மற்றும் கத்திரிக்காய் கறியுடன்' }, price: 380, category: 'Lunch', isVeg: false, image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&q=80&w=800' },

                // Dinner
                { _id: '6', name: { en: 'Chicken Kottu', si: 'චිකන් කොත්තු', ta: 'சிக்கன் கொத்து' }, description: { en: 'Chopped flatbread with veggies, egg and chicken', si: 'රොටි, එළවළු, බිත්තර සහ කුකුළු මස් සමඟ රසවත් කොත්තු', ta: 'காய்கறிகள், முட்டை மற்றும் கோழியுடன் நறுக்கப்பட்ட ரொட்டி' }, price: 400, category: 'Dinner', isVeg: false, image: 'https://images.unsplash.com/photo-1630409351241-e90f0556557d?auto=format&fit=crop&q=80&w=800' },
                { _id: '7', name: { en: 'Cheese Kottu', si: 'චීස් කොත්තු', ta: 'சீஸ் கொத்து' }, description: { en: 'Creamy chicken kottu mixed with melted cheese', si: 'උණු කළ චීස් සමඟ මිශ්‍ර කළ රසවත් කොත්තු', ta: 'உருகிய சீஸ் கலந்து தயாரிக்கப்பட்ட கொத்து' }, price: 550, category: 'Dinner', isVeg: false, image: 'https://images.unsplash.com/photo-1563280145-66746cd4d34f?auto=format&fit=crop&q=80&w=800' },
                { _id: '8', name: { en: 'Seafood Fried Noodles', si: 'සීෆුඩ් නූඩ්ල්ස්', ta: 'கடல் உணவு நூடுல்ஸ்' }, description: { en: 'Stir-fried noodles with mixed seafood and vegetables', si: 'මුහුදු ආහාර සහ එළවළු එක්කළ රසවත් නූඩ්ල්ස්', ta: 'கலப்பு கடல் உணவு மற்றும் காய்கறிகளுடன் பொரித்த நூடுல்ஸ்' }, price: 450, category: 'Dinner', isVeg: false, image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800' },

                // Snacks
                { _id: '9', name: { en: 'Fish Patties', si: 'මාළු පැටිස්', ta: 'மீன் பட்டிஸ்' }, description: { en: 'Golden fried crispy pastry with spicy fish filling', si: 'මාළු මිශ්‍රණයක් සහිත රසවත් පැටිස්', ta: 'காரமான மீன் நிரப்புதலுடன் பொன்னிறமாக வறுத்த மிருதுவான மாவு' }, price: 60, category: 'Snacks', isVeg: false, image: 'https://images.unsplash.com/photo-1601702538934-22f4b5f9038d?auto=format&fit=crop&q=80&w=800' },
                { _id: '10', name: { en: 'Vegetable Roti', si: 'එළවළු රොටි', ta: 'மரக்கறி ரொட்டி' }, description: { en: 'Spicy vegetable mix folded in a soft flatbread', si: 'එළවළු මිශ්‍රණයක් පිරවූ රසවත් රොටියක්', ta: 'ஒரு மென்மையான ரொட்டியில் மடிக்கப்பட்ட காரமான காய்கறி கலவை' }, price: 50, category: 'Snacks', isVeg: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800' },
                { _id: '11', name: { en: 'Fish Cutlet', si: 'මාළු කට්ලට්', ta: 'மீன் கட்லட்' }, description: { en: 'Fried balls of spicy fish and potato mixture', si: 'මාළු සහ අල මිශ්‍රණයකින් සෑදූ රසවත් කට්ලට්', ta: 'காரமான மீன் மற்றும் உருளைக்கிழங்கு கலவையின் வறுத்த உருண்டைகள்' }, price: 40, category: 'Snacks', isVeg: false, image: 'https://images.unsplash.com/photo-1596796332766-3d2b7d4ae7d2?auto=format&fit=crop&q=80&w=800' },

                // Beverages
                { _id: '12', name: { en: 'Milk Tea', si: 'කිරි තේ', ta: 'பால் தேநீர்' }, description: { en: 'Ceylon tea with creamy condensed milk', si: 'කිරි සහිත රසවත් උණුසුම් තේ කෝප්පයක්', ta: 'க்ரீமி கண்டென்ஸ்டு பாலுடன் இலங்கை தேநீர்' }, price: 60, category: 'Beverages', isVeg: true, image: 'https://images.unsplash.com/photo-1594631252845-29fc458695d1?auto=format&fit=crop&q=80&w=800' },
                { _id: '13', name: { en: 'Iced Coffee', si: 'අයිස් කෝපි', ta: 'ஐஸ் காபி' }, description: { en: 'Cold & sweet Sri Lankan style iced coffee', si: 'සිසිල් කළ රසවත් ශ්‍රී ලංකා අයිස් කෝපි', ta: 'குளிர் மற்றும் இனிப்பு இலங்கை ஐஸ் காபி' }, price: 150, category: 'Beverages', isVeg: true, image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=800' },
                { _id: '14', name: { en: 'Fresh Lime Juice', si: 'දෙහි යුෂ', ta: 'எலுமிச்சை ஜூஸ்' }, description: { en: 'Refreshing freshly squeezed lime juice', si: 'නැවුම් දෙහි යුෂ, සීනි හෝ ලුණු සමඟ', ta: 'புத்துணர்ச்சியூட்டும் புதிய எலுமிச்சை சாறு' }, price: 100, category: 'Beverages', isVeg: true, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800' }
            ]);
        };

        fetchMenu();
    }, []);

    // Fetch Queue Status
    useEffect(() => {
        const fetchQueueStatus = async () => {
            try {
                const response = await axios.get('/api/queue/status');
                setQueueData(response.data);
            } catch (err) {
                console.error('Error fetching queue status:', err);
            }
        };

        fetchQueueStatus();
        const interval = setInterval(fetchQueueStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('window' in globalThis && (window.PolyfillSpeechRecognition || window.webkitSpeechRecognition)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = language === 'en' ? 'en-US' : language === 'si' ? 'si-LK' : 'ta-LK';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
                handleVoiceCommand(transcript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [language]);

    const handleVoiceCommand = (command) => {
        const foundItem = menuItems.find(item => {
            const nameEn = item.name.en.toLowerCase();
            const nameSi = item.name.si.toLowerCase();
            const nameTa = item.name.ta.toLowerCase();
            return command.includes(nameEn) || command.includes(nameSi) || command.includes(nameTa);
        });

        if (foundItem) {
            addToCart(foundItem);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
        setIsListening(!isListening);
    };

    const categories = [
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

    const removeFromCartCompletely = (id) => {
        setCart(cart.filter(i => i._id !== id));
    };

    const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subTotal > 0 ? 50 : 0; // Mock fixed tax if cart is not empty
    const cartTotal = subTotal + tax;

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const finalUsername = username || currentUser.username || localStorage.getItem('username');

        if (!finalUsername) {
            alert('Please login to place an order.');
            return;
        }

        if (cart.length === 0) return;

        try {
            await axios.post('/api/orders', {
                username: finalUsername,
                items: cart.map(i => ({ name: i.name.en, quantity: i.quantity, price: i.price })),
                totalAmount: cartTotal,
                pickupTime: new Date(Date.now() + 20 * 60000), // fixed 20 mins for UI demo
            });
            setIsOrdered(true);
            setCart([]);
            setTimeout(() => setIsOrdered(false), 5000);
        } catch (err) {
            console.error('Order Error:', err);
            alert('Failed to place order.');
        }
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 65px)', width: '100%', background: '#F8F9FA', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
            


            {/* --- MIDDLE CONTENT --- */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: '#F9FAFB' }} className="custom-scrollbar">
                
                {/* Top Nav */}
                <div style={{ padding: '1.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(249, 250, 251, 0.9)', backdropFilter: 'blur(10px)' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '0.5rem 1rem', width: '350px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <Search size={18} color="#9CA3AF" />
                                <input 
                                    type="text" 
                                    placeholder="Search food" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '0.5rem', width: '100%', fontSize: '0.9rem', color: '#4B5563' }} 
                                />
                            </div>
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                style={{ background: showFilters ? 'rgba(255, 199, 44, 0.15)' : 'var(--primary-red)', border: showFilters ? '1px solid var(--primary-red)' : 'none', padding: '0.7rem 1.2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: showFilters ? 'var(--primary-red)' : 'white', fontWeight: 600, cursor: 'pointer', boxShadow: showFilters ? 'none' : '0 4px 6px rgba(218, 41, 28, 0.2)', transition: 'all 0.3s' }}
                            >
                                Filter <Filter size={16} />
                            </button>
                        </div>

                        <AnimatePresence>
                            {showFilters && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    style={{ display: 'flex', gap: '0.5rem', background: 'white', padding: '0.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                >
                                    {['All', 'Veg', 'Non-Veg'].map(type => (
                                        <button 
                                            key={type}
                                            onClick={() => setDietaryFilter(type)}
                                            style={{ 
                                                padding: '0.4rem 1rem', 
                                                borderRadius: '8px', 
                                                border: 'none', 
                                                background: dietaryFilter === type ? 'var(--primary-red)' : 'transparent',
                                                color: dietaryFilter === type ? 'white' : '#6B7280',
                                                fontSize: '0.85rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <LanguageSelector currentLang={language} onLanguageChange={setLanguage} />
                            
                            <button
                                onClick={toggleListening}
                                style={{ 
                                    background: isListening ? '#FEE2E2' : '#FFFFFF', 
                                    border: `1px solid ${isListening ? '#FCA5A5' : '#E5E7EB'}`, 
                                    padding: '0.6rem', 
                                    borderRadius: '50%', 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: isListening ? '#EF4444' : '#6B7280',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                            </button>
                        </div>
                        
                        <div style={{ position: 'relative', cursor: 'pointer', padding: '0.5rem', background: '#FFFFFF', borderRadius: '50%', border: '1px solid #E5E7EB' }}>
                            <Bell size={20} color="#4B5563" />
                            <div style={{ position: 'absolute', top: '6px', right: '8px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%', border: '2px solid white' }}></div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#FFFFFF', padding: '0.4rem 0.8rem', borderRadius: '99px', border: '1px solid #E5E7EB', cursor: 'pointer' }}>
                            <img src={user?.picture || 'https://ui-avatars.com/api/?name=User&background=F97316&color=fff'} alt="Profile" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>{user?.name || 'David Brown'}</span>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '0 2.5rem 2rem 2.5rem' }}>
                    {/* Explore Categories */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1F2937' }}>Explore Categories</h2>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem', color: 'var(--primary-red)', fontWeight: 600, background: 'rgba(255, 199, 44, 0.15)', padding: '0.3rem 0.8rem', borderRadius: '6px' }}>
                                <Zap size={14} /> Queue: {queueData.estimatedWaitTime} min wait
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbar">
                            {categories.map((cat, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => setActiveCategory(cat.name)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1.25rem',
                                        background: activeCategory === cat.name ? 'rgba(255, 199, 44, 0.15)' : '#FFFFFF',
                                        border: `1px solid ${activeCategory === cat.name ? 'var(--primary-red)' : '#E5E7EB'}`,
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        minWidth: 'max-content',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                                    <span style={{ fontSize: '0.95rem', fontWeight: activeCategory === cat.name ? 700 : 600, color: activeCategory === cat.name ? 'var(--primary-red)' : '#4B5563' }}>
                                        {cat.displayName}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Popular / Recent Tabs */}
                    <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid #E5E7EB', marginBottom: '1.5rem' }}>
                        <div style={{ paddingBottom: '0.75rem', borderBottom: '3px solid var(--primary-red)', fontWeight: 700, color: '#1F2937', cursor: 'pointer' }}>Popular</div>
                        <div style={{ paddingBottom: '0.75rem', borderBottom: '3px solid transparent', fontWeight: 600, color: '#6B7280', cursor: 'pointer' }}>Recent</div>
                    </div>

                    {/* Items Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {menuItems.filter(item => {
                            const matchesCategory = activeCategory === 'All' || (Array.isArray(item.category) ? item.category.includes(activeCategory) : item.category === activeCategory);
                            const matchesSearch = 
                                item.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                item.name.si.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                item.name.ta.toLowerCase().includes(searchQuery.toLowerCase());
                            const isVegItem = item.isVeg || (Array.isArray(item.dietary) && item.dietary.includes('Veg'));
                            const matchesDietary = 
                                dietaryFilter === 'All' || 
                                (dietaryFilter === 'Veg' && isVegItem) || 
                                (dietaryFilter === 'Non-Veg' && !isVegItem);
                            return matchesCategory && matchesSearch && matchesDietary;
                        }).map(item => (
                            <div 
                                key={item._id} 
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
                                {/* Checkbox / Selector Top Left */}
                                <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', width: '20px', height: '20px', borderRadius: '6px', background: '#F3F4F6', border: '1px solid #E5E7EB' }}></div>
                                
                                <div style={{ width: '100%', height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                                    <img 
                                        src={item.image} 
                                        alt={item.name[language]} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} 
                                    />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1F2937', margin: 0, lineHeight: 1.3 }}>
                                        {item.name[language]}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {(item.dietary?.includes('Veg') || item.isVeg) && <div style={{ width: '12px', height: '12px', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Vegetarian"><div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} /></div>}
                                        {item.dietary?.includes('Non-Veg') && <div style={{ width: '12px', height: '12px', border: '1px solid #f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Non-Vegetarian"><div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f43f5e' }} /></div>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-red)' }}>LKR {item.price}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#9CA3AF', textDecoration: 'line-through' }}>LKR {Math.round(item.price * 1.15)}</span>
                                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <Star size={14} fill="#F59E0B" /> 2.5K+
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                                    <button style={{ flex: 1, padding: '0.75rem', background: '#F3F4F6', border: 'none', borderRadius: '10px', color: '#4B5563', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'background 0.2s' }}>
                                        Wishlist
                                    </button>
                                    <button 
                                        onClick={() => addToCart(item)}
                                        style={{ flex: 1, padding: '0.75rem', background: 'var(--primary-red)', border: 'none', borderRadius: '10px', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'background 0.2s', boxShadow: '0 4px 6px rgba(218, 41, 28, 0.2)' }}
                                    >
                                        Order Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- RIGHT INVOICE / CART SIDEBAR --- */}
            <div style={{ width: '350px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.02)', zIndex: 20 }}>
                <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #F3F4F6' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937', margin: 0 }}>Invoice</h2>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }} className="custom-scrollbar">
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#9CA3AF', marginTop: '3rem' }}>
                            <ShoppingBag size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                            <p>Your basket is empty</p>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={`${item._id}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <img src={item.image} alt={item.name[language]} style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: '#1F2937', fontSize: '0.95rem', marginBottom: '0.2rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name[language]}</div>
                                    <div style={{ fontWeight: 700, color: '#F97316', fontSize: '0.9rem' }}>LKR {item.price} 
                                        <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500, marginLeft: '0.5rem' }}>x {item.quantity}</span>
                                    </div>
                                </div>
                                <Trash2 size={16} color="#EF4444" style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => removeFromCartCompletely(item._id)} />
                            </div>
                        ))
                    )}
                </div>

                <div style={{ padding: '1.5rem', background: '#FFFFFF', borderTop: '1px dashed #E5E7EB' }}>
                    
                    <div style={{ background: '#F8F9FA', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6B7280', marginBottom: '1rem' }}>Payment Summary</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: '#4B5563' }}>
                            <span>Sub Total</span>
                            <span style={{ fontWeight: 600, color: '#1F2937' }}>LKR {subTotal}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem', color: '#4B5563' }}>
                            <span>Tax</span>
                            <span style={{ fontWeight: 600, color: '#1F2937' }}>LKR {tax}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #E5E7EB', fontSize: '1.05rem', fontWeight: 800, color: '#1F2937' }}>
                            <span>Total Payment</span>
                            <span>LKR {cartTotal}</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6B7280', marginBottom: '0.75rem' }}>Payment Method</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <div style={{ background: '#FFF7ED', border: '1px solid #F97316', padding: '0.75rem', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <CreditCard size={24} color="#F97316" />
                            </div>
                            <div style={{ border: '1px solid #E5E7EB', padding: '0.75rem', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#9CA3AF' }}>
                                VISA
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handlePlaceOrder}
                        disabled={cart.length === 0}
                        style={{ 
                            width: '100%', 
                            padding: '1.1rem', 
                            background: cart.length === 0 ? '#FCA5A5' : 'var(--primary-red)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '12px', 
                            fontSize: '1rem', 
                            fontWeight: 700, 
                            cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                            boxShadow: cart.length > 0 ? '0 8px 16px rgba(218, 41, 28, 0.25)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Order Now
                    </button>
                </div>
            </div>

            {/* Order Success Popup */}
            <AnimatePresence>
                {isOrdered && (
                    <motion.div
                        initial={{ y: -50, opacity: 0, x: '-50%' }}
                        animate={{ y: 20, opacity: 1, x: '-50%' }}
                        exit={{ y: -50, opacity: 0, x: '-50%' }}
                        style={{ position: 'fixed', top: '2rem', left: '50%', padding: '1rem 2rem', background: '#10B981', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1100, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                    >
                        <CheckCircle color="white" size={24} />
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>Order Placed Successfully!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CSS for custom elements */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                .item-card-hover:hover {
                    transform: translateY(-4px) !important;
                    box-shadow: 0 12px 24px rgba(0,0,0,0.06) !important;
                }
            `}</style>
        </div>
    );
};

export default OrderingPage;
