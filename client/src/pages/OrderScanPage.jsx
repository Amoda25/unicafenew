import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    CheckCircle, 
    ArrowLeft, 
    ShoppingBag, 
    User, 
    Clock, 
    CreditCard,
    AlertCircle,
    ChevronLeft
} from 'lucide-react';

const OrderScanPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isPaying, setIsPaying] = useState(false);
    const [isPaid, setIsPaid] = useState(false);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await axios.get(`/api/orders/details/${orderId}`);
                setOrder(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError(err.response?.data?.error || 'Order not found');
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const handlePayment = async () => {

        setIsPaying(true);
        try {
            const response = await axios.patch(`/api/orders/pay/${orderId}`);
            setOrder(response.data);
            setIsPaid(true);
        } catch (err) {
            console.error('Payment Error:', err);
            alert('Failed to mark order as paid.');
        } finally {
            setIsPaying(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="loader" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--coffee-dark)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                    <p style={{ color: 'var(--coffee-dark)', fontWeight: 700 }}>Verifying Order Details...</p>
                </div>

            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ textAlign: 'center', background: 'white', padding: '3rem', borderRadius: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' }}>
                    <AlertCircle size={60} color="#EF4444" style={{ marginBottom: '1.5rem' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--coffee-dark)', marginBottom: '1rem' }}>Verification Failed</h2>
                    <p style={{ color: 'var(--coffee-muted)', fontWeight: 600, marginBottom: '2rem' }}>{error}</p>
                    <button 
                        onClick={() => navigate('/order')}
                        style={{ width: '100%', padding: '1rem', background: 'var(--coffee-dark)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Go to Menu
                    </button>
                </div>
            </div>
        );
    }

    const orderStatus = order?.status?.toLowerCase();
    const isActuallyPaid = orderStatus === 'paid' || orderStatus === 'ready' || orderStatus === 'delivered';

    return (
        <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                
                {/* Status Badge */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '2rem' }}
                >
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        background: isActuallyPaid ? '#10B981' : '#6B7280', 
                        color: 'white', 
                        padding: '0.6rem 1.5rem', 
                        borderRadius: '50px', 
                        fontSize: '0.8rem', 
                        fontWeight: 900, 
                        letterSpacing: '1px',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.1)' 
                    }}>
                        {isActuallyPaid ? <CheckCircle size={18} /> : <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'white', animation: 'pulse 1.5s infinite' }}></div>}
                        {isActuallyPaid ? 'ORDER VERIFIED & PAID' : 'PENDING STAFF VERIFICATION'}
                    </div>
                </motion.div>

                {/* Main Card */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ background: 'white', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 30px 60px rgba(0,0,0,0.08)', position: 'relative', marginBottom: '1.5rem', border: '1px solid #F3F4F6' }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid #F3F4F6' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--primary-red)', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '2px' }}>UNICAFÉ MERCHANT PORTAL</p>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1F2937', margin: 0 }}>Digital Voucher</h1>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem', background: '#F9FAFB', padding: '1.25rem', borderRadius: '24px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-red)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <User size={28} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, margin: 0 }}>CUSTOMER NAME</p>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#111827', margin: 0 }}>{order.username?.toUpperCase()}</h2>
                        </div>
                    </div>

                    <div style={{ padding: '0 0.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#374151', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <ShoppingBag size={20} color="var(--primary-red)" /> ORDER DETAILS
                        </h3>
                        {order.items?.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '1rem', color: '#4B5563', fontWeight: 600 }}>
                                    <span style={{ color: '#111827', fontWeight: 800 }}>{item.quantity}x</span> {item.name}
                                </div>
                                <div style={{ fontWeight: 800, color: '#111827', fontSize: '1.05rem' }}>LKR {item.price * item.quantity}</div>
                            </div>
                        ))}
                        
                        <div style={{ margin: '2rem 0', padding: '1.75rem', background: '#F9FAFB', borderRadius: '20px', border: '1px dashed #E5E7EB' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 800, color: '#4B5563' }}>TOTAL TO PAY</span>
                                <span style={{ fontWeight: 900, color: 'var(--primary-red)', fontSize: '1.8rem' }}>LKR {order.totalAmount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Merchant Action Section */}
                    {!isActuallyPaid ? (
                        <div style={{ marginTop: '2.5rem' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '0.8rem', color: '#EF4444', fontWeight: 800, margin: 0 }}>⚠️ STAFF ACTION REQUIRED</p>
                                <p style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, marginTop: '0.25rem' }}>Verify payment before clicking the button below</p>
                            </div>
                            <button 
                                onClick={handlePayment}
                                disabled={isPaying}
                                style={{ 
                                    width: '100%', 
                                    padding: '1.5rem', 
                                    background: 'var(--primary-red)', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '24px', 
                                    fontSize: '1.15rem', 
                                    fontWeight: 900, 
                                    cursor: isPaying ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 20px 40px rgba(218, 41, 28, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {isPaying ? 'Processing...' : 'MARK AS PAID & CONFIRM'}
                            </button>
                        </div>
                    ) : (
                        <div style={{ 
                            marginTop: '2.5rem',
                            width: '100%', 
                            padding: '1.5rem', 
                            background: '#10B981', 
                            color: 'white', 
                            borderRadius: '24px', 
                            fontSize: '1.15rem', 
                            fontWeight: 900, 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            boxShadow: '0 15px 30px rgba(16, 185, 129, 0.2)'
                        }}>
                            <CheckCircle size={28} /> VOUCHER REDEEMED
                        </div>
                    )}
                </motion.div>

                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                    <p style={{ color: '#9CA3AF', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px' }}>
                        SECURED BY UNICAFÉ OPERATIONAL TRUST
                    </p>
                    <style>{`
                        @keyframes pulse {
                            0% { transform: scale(1); opacity: 1; }
                            50% { transform: scale(1.5); opacity: 0.5; }
                            100% { transform: scale(1); opacity: 1; }
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
};


export default OrderScanPage;
