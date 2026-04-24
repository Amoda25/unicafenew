import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
    CheckCircle, 
    ArrowLeft, 
    Download, 
    Share2, 
    Clock, 
    Info,
    Calendar,
    ReceiptText
} from 'lucide-react';

const OrderSuccessPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    // --- QR CODE GENERATION LOGIC ---
    // Construct the unique URL that will be encoded into the QR code.
    // This URL leads to the order scanning page for the cashier.
    const scanUrl = `${window.location.origin}/order-scan/${orderId}`;

    // Generate the QR code image URL using the QRServer external API.
    // We pass the scanUrl as the data to be encoded.
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(scanUrl)}`;
    // ---------------------------------

    const [status, setStatus] = React.useState('pending');



    React.useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await axios.get(`/api/orders/details/${orderId}`);
                setStatus(response.data.status);
            } catch (err) {
                console.error('Error polling status:', err);
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, [orderId]);

    const isPaid = status === 'Paid' || status === 'preparing' || status === 'process' || status === 'cookd' || status === 'ready' || status === 'picked-up';


    return (
        <div style={{ minHeight: '100vh', background: 'var(--coffee-light)', padding: '4rem 1rem' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ width: '80px', height: '80px', borderRadius: '50%', background: isPaid ? '#10B981' : '#F59E0B', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 20px rgba(16,185,129,0.2)' }}
                    >
                        {isPaid ? <CheckCircle size={45} /> : <div style={{ width: 30, height: 30, borderRadius: '50%', border: '4px solid white', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>}
                    </motion.div>
                    <motion.h1 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--coffee-dark)', margin: '0 0 1rem', letterSpacing: '-1px' }}
                    >
                        {isPaid ? 'Payment' : 'Order'} <span style={{ color: 'var(--latte-highlight)' }}>{isPaid ? 'Verified!' : 'Placed!'}</span>
                    </motion.h1>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.6rem', 
                            background: isPaid ? '#DCFCE7' : '#FEF3C7', 
                            color: isPaid ? '#15803D' : '#92400E', 
                            padding: '0.6rem 1.2rem', 
                            borderRadius: '50px', 
                            fontSize: '0.9rem', 
                            fontWeight: 800,
                            marginBottom: '1rem'
                        }}
                    >
                        {isPaid ? <CheckCircle size={18} /> : <Clock size={18} />}
                        {isPaid ? 'PAID & CONFIRMED' : 'AWAITING CASHIER PAYMENT'}
                    </motion.div>
                    <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{ color: 'var(--coffee-muted)', fontSize: '1.1rem', fontWeight: 600 }}
                    >
                        {isPaid ? "We've received your payment. Your meal is being prepared!" : "Show the QR code below to the cashier to pay."}
                    </motion.p>
                </div>


                {/* Main QR Card */}
                <motion.div 
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="glass"
                    style={{ padding: '3rem', borderRadius: '40px', textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'var(--latte-highlight)' }}></div>
                    
                    <div style={{ marginBottom: '2.5rem' }}>
                        {/* Display the generated QR code image */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '30px', border: '1px solid #e2e8f0', display: 'inline-block', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.02)' }}>
                            <img 
                                src={qrUrl} 
                                alt="Order QR Code" 
                                style={{ width: '250px', height: '250px', borderRadius: '15px' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--coffee-dark)', margin: '0 0 0.5rem' }}>Your Unique Pickup Code</h2>
                        <p style={{ color: 'var(--coffee-muted)', fontSize: '0.9rem', margin: 0, fontWeight: 700, letterSpacing: '2px' }}>
                            ORDER ID: {orderId?.toUpperCase()}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '2px dashed var(--latte-border)', paddingTop: '2.5rem' }}>
                        <div style={{ textAlign: 'left', padding: '1rem', background: '#f8fafc', borderRadius: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--coffee-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                <Clock size={16} /> ESTIMATED PICKUP
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--coffee-dark)' }}>20 Mins</div>
                        </div>
                        <div style={{ textAlign: 'left', padding: '1rem', background: '#f8fafc', borderRadius: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--coffee-muted)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                <Info size={16} /> PICKUP POINT
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--coffee-dark)' }}>Counter A</div>
                        </div>
                    </div>
                </motion.div>

                {/* Additional Actions */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            onClick={async () => {
                                // Logic to download the QR code image as a PNG file
                                try {
                                    const response = await fetch(qrUrl);
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `UniCafe-Order-${orderId}.png`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                } catch (err) {
                                    alert('Failed to save QR code. Please try again.');
                                }
                            }}
                            style={{ flex: 1, padding: '1rem', background: 'white', border: '2px solid var(--latte-border)', borderRadius: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--coffee-dark)' }}
                        >
                            <Download size={20} /> Save QR
                        </button>
                        <button 
                            onClick={async () => {
                                const shareData = {
                                    title: 'UniCafe Order Receipt',
                                    text: `Order ID: ${orderId?.toUpperCase()}`,
                                    url: scanUrl,
                                };
                                if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                                    try {
                                        await navigator.share(shareData);
                                    } catch (err) {
                                        if (err.name !== 'AbortError') {
                                            navigator.clipboard.writeText(scanUrl);
                                            alert('Link copied to clipboard!');
                                        }
                                    }
                                } else {
                                    navigator.clipboard.writeText(scanUrl);
                                    alert('Link copied to clipboard!');
                                }
                            }}
                            style={{ flex: 1, padding: '1rem', background: 'white', border: '2px solid var(--latte-border)', borderRadius: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--coffee-dark)' }}
                        >
                            <Share2 size={20} /> Share Link
                        </button>
                    </div>


                    <button 
                        onClick={() => navigate('/order')}
                        style={{ width: '100%', padding: '1.25rem', background: 'var(--coffee-dark)', color: 'white', border: 'none', borderRadius: '20px', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 25px rgba(59,31,14,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                    >
                        <ArrowLeft size={22} /> Return to Menu
                    </button>
                </motion.div>

                {/* Trust Badges */}
                <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '2rem', opacity: 0.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 700 }}>
                        <ReceiptText size={16} /> Official Receipt
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 700 }}>
                        <Calendar size={16} /> {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
