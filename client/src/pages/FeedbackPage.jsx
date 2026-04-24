import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
    Star,
    Camera,
    Send,
    AlertCircle,
    CheckCircle,
    MessageSquare,
    ThumbsUp,
    Heart,
    Smile,
    Meh,
    Frown,
    Angry,
    UserCircle
} from 'lucide-react';

const FeedbackPage = () => {
    // --- STATE DEFINITIONS ---
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('orderId'); // Optional orderId passed from success page

    const [rating, setRating] = useState(0); // Star rating (1-5)
    const [hover, setHover] = useState(0); // For star hover effect
    const [quickRating, setQuickRating] = useState(null); // Mood-based rating (Love, Happy, etc.)
    const [category, setCategory] = useState('Food'); // Category being reviewed
    const [comment, setComment] = useState(''); // Textual feedback
    const [isAnonymous, setIsAnonymous] = useState(false); // Option to hide user ID
    const [submitted, setSubmitted] = useState(false);
    const [complaintText, setComplaintText] = useState(''); // Text for the separate complaint box
    const [hasOrders, setHasOrders] = useState(true); // Verification: did the user actually buy anything?
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null); // Photo file for upload
    const [imagePreview, setImagePreview] = useState(null); // Local preview of the uploaded photo
    const [isUploading, setIsUploading] = useState(false); // API progress state
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Success toast
    const [successType, setSuccessType] = useState('Feedback');
    const [error, setError] = useState('');
    // -------------------------

    // --- VERIFICATION LOGIC ---
    // Check if the current user has any previous orders.
    // If not, we restrict them from rating food (to prevent fake reviews).
    useEffect(() => {
        const checkOrders = async () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                try {
                    const response = await axios.get(`/api/orders/${user.username}`);
                    setHasOrders(response.data.length > 0); // User must have at least 1 order
                } catch (error) {
                    console.error('Error checking orders:', error);
                }
            } else {
                setHasOrders(false);
            }
            setIsLoadingOrders(false);
        };
        checkOrders();
    }, []);
    // ---------------------------

    const emojis = [
        { icon: Heart, label: 'Love', color: '#ef4444' },
        { icon: Smile, label: 'Happy', color: '#10b981' },
        { icon: Meh, label: 'Neutral', color: '#f59e0b' },
        { icon: Frown, label: 'Sad', color: '#6366f1' },
        { icon: Angry, label: 'Angry', color: '#ef4444' }
    ];

    const topMeals = [
        { name: 'Kottu Roti Special', rating: 4.8, reviews: 124, image: '🍛' },
        { name: 'Vegetable Fried Rice', rating: 4.6, reviews: 89, image: '🍚' },
        { name: 'Chicken Curry Rice', rating: 4.5, reviews: 156, image: '🍗' }
    ];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // --- FEEDBACK SUBMISSION ---
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');

        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const username = user ? user.username : 'Unknown User';

        try {
            // FALLBACK: If no rating is selected but there is a comment, 
            // we send it to the contact/complaint system instead of feedback.
            if (rating === 0 && !quickRating && comment.trim()) {
                await axios.post('/api/contact', {
                    name: 'Anonymous User',
                    email: 'hidden@unicafe.com',
                    isAnonymous: true,
                    message: `[FEEDBACK FALLBACK] ${comment}`,
                });
                
                setSuccessType('Feedback');
                setShowSuccessModal(true);
                setComment('');
                setTimeout(() => setShowSuccessModal(false), 5000);
                return;
            }

            // Validation: User must provide some kind of rating
            if (rating === 0 && !quickRating) {
                setError('Please provide a star rating or select a mood.');
                return;
            }

            setIsUploading(true);
            let finalImageUrl = '';

            // 1. Image Upload Logic: If a photo was selected, upload it to the server first
            if (selectedFile) {
                const formData = new FormData();
                formData.append('image', selectedFile);
                const uploadRes = await axios.post('/api/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalImageUrl = uploadRes.data.imageUrl; // Get the URL of the uploaded image
            }

            // 2. Sentiment Mapping: Map the selected mood emoji to a sentiment category
            let sentiment = 'Neutral';
            if (quickRating === 'Love' || quickRating === 'Happy') sentiment = 'Positive';
            else if (quickRating === 'Sad' || quickRating === 'Angry') sentiment = 'Negative';

            // 3. Final Submission: Send all feedback data to the feedback API
            await axios.post('/api/feedback', {
                username,
                rating,
                sentiment,
                orderId,
                category,
                comment,
                isAnonymous,
                imageUrl: finalImageUrl
            });

            // UI Cleanup after success
            setSuccessType('Feedback');
            setShowSuccessModal(true);
            setRating(0);
            setComment('');
            setQuickRating(null);
            setSelectedFile(null);
            setImagePreview(null);
            
            setError('');
            setTimeout(() => setShowSuccessModal(false), 5000); 
        } catch (err) {
            console.error('Error submitting feedback:', err);
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to submit feedback. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };
    // ---------------------------

    const handleComplaintSubmit = async () => {
        if (!complaintText.trim()) {
            setError('Please enter your complaint before sending.');
            return;
        }
        setError('');
        
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const username = user ? user.username : 'Unknown';

        try {
            await axios.post('/api/contact', {
                name: isAnonymous ? 'Anonymous User' : username,
                email: isAnonymous ? 'hidden@unicafe.com' : (user?.email || `${username}@unicafe.com`),
                isAnonymous: isAnonymous,
                message: complaintText,
            });
            setComplaintText('');
            setSuccessType('Complaint');
            setShowSuccessModal(true);
            setTimeout(() => setShowSuccessModal(false), 5000);
            setError('');
        } catch (err) {
            console.error('Error submitting complaint:', err);
            setError('Failed to send complaint. Please try again.');
        }
    };

    return (
        <div className="feedback-page" style={{ padding: '80px 5%', minHeight: '100vh', background: 'var(--bg-page)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '60px' }}
            >
                <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '16px', color: 'var(--text-main)' }}>
                    Your <span className="gradient-text">Feedback</span> Matters
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Help us improve your UniCafé experience.</p>
            </motion.div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                            maxWidth: '600px',
                            margin: '-40px auto 40px',
                            padding: '16px 24px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '16px',
                            color: '#ef4444',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >
                        <AlertCircle size={20} />
                        <span style={{ flex: 1 }}>{error}</span>
                        <button onClick={() => setError('')} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>&times;</button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
                {/* Left Side: Rating Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <motion.div
                        className="glass"
                        style={{ padding: '40px', borderRadius: '32px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}
                    >
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)' }}>
                            <Star style={{ color: 'var(--primary)' }} /> Rate Your Last Meal
                        </h3>

                        {!hasOrders && !isLoadingOrders ? (
                            <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '24px' }}>
                                <p style={{ color: '#ef4444', fontSize: '0.95rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={18} /> Feedback Restricted
                                </p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px', lineHeight: 1.5 }}>
                                    Only students who have placed at least one order can submit food ratings. 
                                    Please place an order first to share your experience!
                                </p>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '32px' }}>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={32}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHover(star)}
                                                onMouseLeave={() => setHover(0)}
                                                style={{
                                                    cursor: 'pointer',
                                                    fill: (hover || rating) >= star ? 'var(--primary)' : 'transparent',
                                                    color: (hover || rating) >= star ? 'var(--primary)' : 'var(--text-secondary)',
                                                    transition: 'transform 0.1s'
                                                }}
                                                className="star-hover"
                                            />
                                        ))}
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        {rating > 0 ? `You rated this ${rating} stars` : 'Select a rating'}
                                    </p>
                                </div>

                                <div style={{ marginBottom: '32px' }}>
                                    <label style={{ display: 'block', marginBottom: '16px', fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>Feedback Category</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                        {['Food', 'Service', 'Delivery'].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setCategory(cat)}
                                                style={{
                                                    padding: '12px',
                                                    borderRadius: '16px',
                                                    border: category === cat ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                                                    background: category === cat ? 'rgba(110, 89, 255, 0.1)' : 'transparent',
                                                    color: category === cat ? 'var(--primary)' : 'var(--text-secondary)',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '32px' }}>
                                    <label style={{ display: 'block', marginBottom: '16px', fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>Quick Mood</label>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        {emojis.map((e, idx) => (
                                            <motion.button
                                                key={idx}
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setQuickRating(e.label)}
                                                style={{
                                                    background: quickRating === e.label ? `${e.color}15` : 'transparent',
                                                    border: quickRating === e.label ? `2px solid ${e.color}` : '1px solid var(--glass-border)',
                                                    padding: '12px',
                                                    borderRadius: '16px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    width: '60px'
                                                }}
                                            >
                                                <e.icon size={24} style={{ color: e.color }} />
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '32px' }}>
                                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>Additional Comments</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="e.g. Food was cold or Service was fast..."
                                        className="glass"
                                        style={{
                                            width: '100%',
                                            minHeight: '120px',
                                            padding: '16px',
                                            borderRadius: '20px',
                                            background: 'var(--bg-page)',
                                            color: 'var(--text-main)',
                                            border: '1px solid var(--glass-border)',
                                            resize: 'vertical',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '32px' }}>
                                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: 700, color: 'var(--text-main)' }}>Upload Photo</label>
                                    <label className="glass" style={{ height: '140px', border: '2px dashed var(--glass-border)', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', position: 'relative', overflow: 'hidden', margin: 0 }}>
                                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }} />
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <>
                                                <Camera size={32} style={{ marginBottom: '8px' }} />
                                                <span style={{ fontSize: '0.85rem' }}>Click to take or upload a photo</span>
                                            </>
                                        )}
                                    </label>
                                    {imagePreview && (
                                        <button onClick={() => {setSelectedFile(null); setImagePreview(null);}} style={{ marginTop: '8px', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 700 }}>Remove Photo</button>
                                    )}
                                </div>

                                <button onClick={handleSubmit} disabled={isUploading} className="btn-premium" style={{ width: '100%', padding: '16px', cursor: isUploading ? 'wait' : 'pointer', opacity: isUploading ? 0.7 : 1 }}>
                                    <Send size={18} style={{ marginRight: '8px' }} /> {isUploading ? 'Uploading...' : 'Submit Review'}
                                </button>
                            </>
                        )}
                    </motion.div>

                    {/* Anonymous Box */}
                    <div className="glass" style={{ padding: '30px', borderRadius: '32px', background: 'rgba(59, 10, 0, 0.02)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444' }}>
                            <AlertCircle size={20} /> Anonymous Complaint Box
                        </h3>
                        <textarea
                            placeholder="Share your concerns privately..."
                            value={complaintText}
                            onChange={(e) => setComplaintText(e.target.value)}
                            style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'white', border: '1px solid var(--glass-border)', resize: 'none', marginBottom: '16px', minHeight: '100px' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <input
                                    type="checkbox"
                                    checked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                Remain Anonymous
                            </label>
                            <button onClick={handleComplaintSubmit} className="glass" style={{ padding: '8px 20px', borderRadius: '12px', color: '#ef4444', border: '1px solid #ef444433', fontWeight: 600 }}>Send</button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Analytics & Social */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div className="glass" style={{ padding: '40px', borderRadius: '32px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)' }}>
                            <ThumbsUp style={{ color: 'var(--primary)' }} /> Weekly Top Rated
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {topMeals.map((meal, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ x: 10 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', borderRadius: '20px', background: 'rgba(59, 10, 0, 0.03)' }}
                                >
                                    <div style={{ fontSize: '2rem', background: 'white', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {meal.image}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{meal.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            <Star size={14} style={{ fill: 'var(--primary)', color: 'var(--primary)' }} />
                                            {meal.rating} ({meal.reviews} reviews)
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}># {idx + 1}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '40px', borderRadius: '32px', background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)', color: 'var(--text-main)' }}>
                        <MessageSquare size={40} style={{ marginBottom: '20px' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '12px' }}>Feedback Acknowledgement</h3>
                        <p style={{ lineHeight: 1.6, opacity: 0.9 }}>
                            Our management team reviews every piece of feedback. Each report helps us maintain
                            the highest standards of hygiene, taste, and efficiency in your UniCafé.
                        </p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showSuccessModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            style={{
                                background: 'white',
                                padding: '48px',
                                borderRadius: '32px',
                                textAlign: 'center',
                                maxWidth: '480px',
                                margin: '20px',
                                boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)',
                                position: 'relative'
                            }}
                        >
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: '#10b981',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)'
                            }}>
                                <CheckCircle size={40} color="white" />
                            </div>
                            
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '16px', color: '#111827' }}>
                                Submission Successful!
                            </h2>
                            
                            <p style={{ color: '#4b5563', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '32px' }}>
                                {successType === 'Feedback' 
                                    ? "Thank you for your valuable feedback! Our team will review it to improve your UniCafé experience."
                                    : "We've received your concern. Rest assured, our management team reviews all messages for continuous improvement."
                                }
                            </p>
                            
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    background: '#111827',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                Continue
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FeedbackPage;
