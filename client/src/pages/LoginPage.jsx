import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, CheckCircle, Eye, EyeOff, Facebook, Instagram } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import heroBg from '../assets/hero_bg.png';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        if (!credentialResponse?.credential) {
            setError('Google Login requires a valid Client ID. Please configure it in GoogleAuthWrapper.jsx');
            return;
        }
        try {
            const response = await axios.post('/api/auth/google', {
                tokenId: credentialResponse.credential
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setSuccess(true);
            setTimeout(() => {
                const redirectPath = (response.data.user.role === 'admin' || response.data.user.role === 'staff') ? '/admin' : response.data.user.role === 'inventory' ? '/ims' : '/';
                navigate(redirectPath);
                window.location.reload();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Google login failed');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 1) {
            return setError('Password is required');
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        try {
            const response = await axios.post('/api/auth/login', {
                username,
                password
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('username', response.data.user.username);
            setSuccess(true);
            setTimeout(() => {
                const redirectPath = (response.data.user.role === 'admin' || response.data.user.role === 'staff') ? '/admin' : response.data.user.role === 'inventory' ? '/ims' : '/';
                navigate(redirectPath);
                window.location.reload(); // Refresh to update header state
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4rem 5%',
            backgroundImage: `linear-gradient(rgba(15, 18, 21, 0.8), rgba(15, 18, 21, 0.95)), url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            flexWrap: 'wrap',
            gap: '2rem'
        }}>
            {/* Success Popup */}
            {success && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    style={{
                        position: 'fixed',
                        top: '2rem',
                        right: '2rem',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        padding: '1.5rem 2rem',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        boxShadow: '0 20px 60px rgba(16, 185, 129, 0.4)',
                        zIndex: 1000,
                        color: 'white',
                        fontWeight: 600
                    }}
                >
                    <CheckCircle size={24} />
                    <div>
                        <div style={{ fontSize: '1.125rem' }}>Login Successful!</div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Welcome back! Redirecting...</div>
                    </div>
                </motion.div>
            )}

            {/* Left Side text */}
            <div style={{ flex: '1 1 400px', paddingRight: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <h1 style={{
                    fontSize: 'clamp(4rem, 8vw, 7rem)',
                    color: 'var(--primary)',
                    fontFamily: 'cursive, "Brush Script MT", "Comic Sans MS"',
                    textShadow: '0 4px 20px rgba(255,199,44,0.3)',
                    fontWeight: 'bold',
                    margin: 0,
                    lineHeight: 1
                }}>
                    UniCafé
                </h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
                        color: 'white',
                        margin: 0,
                        fontWeight: 500,
                        letterSpacing: '0.5px',
                        textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                        opacity: 0.9,
                        fontStyle: 'italic'
                    }}
                >
                    Your Campus Café, Just a Click Away
                </motion.p>
            </div>

            {/* Right Side Form */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                    flex: '0 1 480px',
                    width: '100%',
                    padding: '3rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '24px',
                    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 600, margin: 0, color: 'white', fontFamily: 'serif' }}>Log In</h2>
                    <Link to="/signup" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Log In / Sign Up</Link>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.4)', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '1rem', color: 'white', fontWeight: 500, marginBottom: '0.5rem' }}>Username / Student ID</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username or Student ID"
                            className="glass-input glass-input-dark"
                            style={{ color: 'white' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '1rem', color: 'white', fontWeight: 500, marginBottom: '0.5rem' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Your Password"
                                className="glass-input glass-input-dark"
                                style={{ paddingRight: '2.5rem', color: 'white' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0.7
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <a href="#" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem', opacity: 0.9 }}>Forgot Password?</a>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                        <button type="submit" style={{
                            background: 'var(--primary)',
                            color: 'var(--primary-black)',
                            padding: '10px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(255,199,44,0.2)'
                        }}>
                            Log In
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
                        <span style={{ color: 'white', fontSize: '1rem', fontWeight: 500 }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div 
                            onClick={handleGoogleSuccess}
                            style={{ 
                                width: '48px', 
                                height: '48px', 
                                borderRadius: '50%', 
                                background: 'white', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"/>
                            </svg>
                        </div>
                        <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '50%', 
                            background: '#1877F2', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(24, 119, 242, 0.3)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Facebook size={24} color="white" fill="white" />
                        </div>
                        <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '12px', 
                            background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(214, 36, 159, 0.3)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Instagram size={24} color="white" />
                        </div>
                    </div>

                    <p style={{ textAlign: 'center', color: 'white', opacity: 0.9, fontSize: '0.95rem', margin: 0 }}>
                        Don't have a account? <Link to="/signup" style={{ color: 'white', textDecoration: 'underline' }}>Sign up</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default LoginPage;
