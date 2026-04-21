import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CreditCard, 
    CheckCircle, Truck, ShieldCheck, Clock, Heart, ShoppingCart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CartPage = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
    const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('wishlist') || '[]'));
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [isProcessing, setIsProcessing] = useState(false);



    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        window.dispatchEvent(new Event('cartUpdated'));
    }, [cart, wishlist]);

    const updateQuantity = (id, delta) => {
        setCart(cart.map(item => {
            if (item._id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeItem = (id, type = 'cart') => {
        if (type === 'cart') {
            setCart(cart.filter(item => item._id !== id));
        } else {
            setWishlist(wishlist.filter(item => item._id !== id));
        }
    };

    const moveToCart = (item) => {
        setWishlist(wishlist.filter(i => i._id !== item._id));
        const existing = cart.find(i => i._id === item._id);
        if (existing) {
            setCart(cart.map(i => i._id === item._id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i));
        } else {
            setCart([...cart, { ...item, quantity: item.quantity || 1 }]);
        }
    };

    const moveToWishlist = (item) => {
        setCart(cart.filter(i => i._id !== item._id));
        const existing = wishlist.find(i => i._id === item._id);
        if (!existing) {
            setWishlist([...wishlist, { ...item, quantity: 1 }]);
        }
    };

    const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subTotal > 0 ? 50 : 0;
    const total = subTotal + tax;

    const handlePlaceOrder = async () => {
        const username = user.username || localStorage.getItem('username');
        if (!username) {
            alert('Please login to place an order.');
            navigate('/login');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await axios.post('/api/orders', {
                username,
                items: cart.map(i => ({ name: typeof i.name === 'object' ? i.name.en : i.name, quantity: i.quantity, price: i.price })),
                totalAmount: total,
                pickupTime: new Date(Date.now() + 20 * 60000),
            });
            setCart([]);
            navigate(`/order-success/${response.data._id}`);
        } catch (err) {
            console.error('Order Error:', err);
            alert('Failed to place order.');
        } finally {
            setIsProcessing(false);
        }
    };



    const CartItem = ({ item, isWishlist = false }) => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="glass"
            style={{ 
                padding: '1.5rem', 
                borderRadius: '24px', 
                display: 'flex', 
                gap: '1.5rem', 
                alignItems: 'center', 
                position: 'relative',
                opacity: isWishlist ? 0.8 : 1,
                border: isWishlist ? '1px solid var(--latte-border)' : '1px solid transparent'
            }}
        >
            <div style={{ width: '100px', height: '100px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0 }}>
                <img src={item.image} alt={typeof item.name === 'object' ? item.name.en : item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--coffee-dark)', margin: 0 }}>
                            {typeof item.name === 'object' ? item.name.en : item.name}
                        </h3>
                        <p style={{ color: 'var(--coffee-muted)', fontSize: '0.8rem', margin: '4px 0 0' }}>
                            LKR {item.price} each
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                            onClick={() => isWishlist ? moveToCart(item) : moveToWishlist(item)}
                            title={isWishlist ? "Move to Cart" : "Save for Later"}
                            style={{ background: '#f1f5f9', border: 'none', color: isWishlist ? 'var(--coffee-dark)' : '#E11D48', cursor: 'pointer', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {isWishlist ? <ShoppingCart size={18} /> : <Heart size={18} fill="#E11D48" />}
                        </button>
                        <button 
                            onClick={() => removeItem(item._id, isWishlist ? 'wishlist' : 'cart')}
                            style={{ background: '#fef2f2', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '8px', borderRadius: '10px' }}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
                
                {!isWishlist && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#ffffff', padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            <button onClick={() => updateQuantity(item._id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--coffee-dark)', display: 'flex', alignItems: 'center' }}><Minus size={14} /></button>
                            <span style={{ fontWeight: 800, minWidth: '20px', textAlign: 'center', color: 'var(--coffee-dark)', fontSize: '0.9rem' }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item._id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--coffee-dark)', display: 'flex', alignItems: 'center' }}><Plus size={14} /></button>
                        </div>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--coffee-dark)' }}>LKR {item.price * item.quantity}</span>
                    </div>
                )}
                {isWishlist && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--coffee-muted)', fontStyle: 'italic' }}>
                        Saved for later
                    </div>
                )}
            </div>
        </motion.div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--coffee-light)', padding: '3rem 1rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                    <button 
                        onClick={() => navigate('/order')}
                        style={{ background: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: 'var(--coffee-dark)' }}
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--coffee-dark)', margin: 0, letterSpacing: '-1px' }}>Your Shopping <span style={{ color: 'var(--latte-highlight)' }}>Cart</span></h1>
                </div>

                {cart.length === 0 && wishlist.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <ShoppingBag size={80} color="var(--coffee-muted)" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--coffee-dark)', marginBottom: '1rem' }}>Your cart is empty</h2>
                        <button onClick={() => navigate('/order')} style={{ padding: '1rem 2rem', background: 'var(--coffee-dark)', color: 'white', border: 'none', borderRadius: '50px', fontWeight: 700, cursor: 'pointer' }}>Browse Menu</button>
                    </div>
                ) : (

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2.5rem', alignItems: 'start' }}>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            {/* Items List - ORDER */}
                            {cart.length > 0 && (
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--coffee-dark)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <ShoppingCart size={24} /> My Order ({cart.length})
                                    </h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <AnimatePresence>
                                            {cart.map((item) => <CartItem key={item._id} item={item} />)}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}

                            {/* Items List - WISHLIST */}
                            {wishlist.length > 0 && (
                                <div style={{ opacity: 0.9 }}>
                                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--coffee-muted)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Heart size={20} /> Saved for Later ({wishlist.length})
                                    </h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <AnimatePresence>
                                            {wishlist.map((item) => <CartItem key={item._id} item={item} isWishlist={true} />)}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Summary Sidebar */}
                        <div style={{ position: 'sticky', top: '2rem' }}>
                            <div className="glass" style={{ padding: '2rem', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--coffee-dark)', marginBottom: '1.5rem', borderBottom: '1px solid var(--latte-border)', paddingBottom: '1rem' }}>Order Summary</h2>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--coffee-muted)', fontWeight: 600 }}>
                                        <span>Subtotal</span>
                                        <span>LKR {subTotal}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--coffee-muted)', fontWeight: 600 }}>
                                        <span>Service Fee</span>
                                        <span>LKR {tax}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 0 0', borderTop: '2px dashed var(--latte-border)', fontWeight: 900, color: 'var(--coffee-dark)', fontSize: '1.5rem' }}>
                                        <span>Total</span>
                                        <span>LKR {total}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={handlePlaceOrder}
                                    disabled={cart.length === 0 || isProcessing}
                                    style={{ 
                                        width: '100%', 
                                        padding: '1.25rem', 
                                        background: cart.length === 0 || isProcessing ? '#CBD5E1' : 'var(--coffee-dark)', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '16px', 
                                        fontSize: '1.1rem', 
                                        fontWeight: 800, 
                                        cursor: cart.length === 0 || isProcessing ? 'not-allowed' : 'pointer',
                                        boxShadow: cart.length === 0 || isProcessing ? 'none' : '0 8px 25px rgba(59,31,14,0.3)', 
                                        transition: 'all 0.3s', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        gap: '0.75rem', 
                                        marginBottom: '1.5rem' 
                                    }}
                                >
                                    <CheckCircle size={22} /> {isProcessing ? 'Processing...' : (cart.length === 0 ? 'Add items to order' : 'Proceed to Order')}

                                </button>


                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--coffee-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <Clock size={16} /> Est. Pickup in 20 mins
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--coffee-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <Truck size={16} /> Instant Order Notification
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};


export default CartPage;

