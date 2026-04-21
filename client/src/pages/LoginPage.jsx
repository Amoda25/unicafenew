import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, CheckCircle, Eye, EyeOff, Facebook, Instagram } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import heroBg from '../assets/hero_bg.png';
import campusBg from '../assets/campus_bg.png';
import unicafeLogo from '../assets/unicafe_logo_vintage.png';

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
            padding: '4rem 8%',
            backgroundImage: `linear-gradient(rgba(245, 240, 232, 0.8), rgba(245, 240, 232, 0.6)), url(${campusBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            flexWrap: 'wrap',
            gap: '2rem',
            position: 'relative',
            overflow: 'hidden'
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
                        background: 'var(--coffee-dark)',
                        padding: '1.2rem 2.2rem',
                        borderRadius: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.2rem',
                        boxShadow: '0 20px 40px rgba(59, 31, 14, 0.2)',
                        zIndex: 1000,
                        color: 'white',
                        fontWeight: 600,
                        border: '1px solid var(--latte-border)'
                    }}
                >
                    <CheckCircle size={24} color="var(--latte-highlight)" />
                    <div>
                        <div style={{ fontSize: '1rem' }}>Login Successful!</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Welcome back to UniCafé!</div>
                    </div>
                </motion.div>
            )}

            {/* Left Side text */}
            <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', zIndex: 1, marginTop: '-4rem' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{
                        width: '240px',
                        height: '180px',
                        overflow: 'visible',
                        filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.15))',
                        marginBottom: '1rem',
                    }}
                >
                    <img src={unicafeLogo} alt="UniCafé Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </motion.div>
                <h1 style={{
                    fontSize: 'clamp(5rem, 10vw, 9rem)',
                    color: 'var(--coffee-dark)',
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 900,
                    margin: 0,
                    lineHeight: 1,
                    letterSpacing: '-2px',
                    textShadow: '0 10px 30px rgba(59, 31, 14, 0.1)'
                }}>
                    UniCafé
                </h1>

                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    style={{
                        fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                        color: 'var(--coffee-dark)',
                        margin: '1rem 0 0 0',
                        fontWeight: 900,
                        letterSpacing: '-0.5px',
                        lineHeight: 1.2,
                        maxWidth: '500px'
                    }}
                >
                    Fueling Your Academic Success, <br/>One Cup at a Time.
                </motion.p>
                <div style={{ height: '6px', width: '100px', background: 'var(--coffee-dark)', borderRadius: '5px', marginTop: '1.5rem', opacity: 0.8, alignSelf: 'center' }}></div>
            </div>

            {/* Right Side Form */}
            <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                    flex: '0 1 380px',
                    width: '100%',
                    padding: '1.6rem',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '32px',
                    boxShadow: '0 30px 80px rgba(59, 31, 14, 0.12)',
                    zIndex: 1
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--latte-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, color: 'var(--coffee-dark)', letterSpacing: '-1px' }}>Log In</h2>
                    <Link to="/signup" style={{ 
                        color: 'var(--coffee-muted)', 
                        textDecoration: 'none', 
                        fontSize: '0.9rem', 
                        fontWeight: 800,
                        padding: '8px 20px',
                        borderRadius: '25px',
                        background: 'rgba(59, 31, 14, 0.05)',
                        transition: 'all 0.25s ease'
                    }}>Join Now</Link>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ background: '#fef2f2', color: '#991b1b', padding: '0.8rem 1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #fee2e2', fontSize: '0.85rem', fontWeight: 700 }}>
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--coffee-dark)', fontWeight: 800, marginBottom: '0.5rem', marginLeft: '5px' }}>Username / Student ID</label>
                        <div style={{ position: 'relative' }}>
                            <User size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--coffee-soft)', opacity: 0.6 }} />
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter Username"
                                className="glass-input"
                                style={{ padding: '12px 12px 12px 46px', background: '#fff', border: '1px solid var(--latte-border)', borderRadius: '14px', fontSize: '0.95rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '0.8rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--coffee-dark)', fontWeight: 800, marginBottom: '0.5rem', marginLeft: '5px' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--coffee-soft)', opacity: 0.6 }} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="glass-input"
                                style={{ padding: '12px 46px 12px 46px', background: '#fff', border: '1px solid var(--latte-border)', borderRadius: '14px', fontSize: '0.95rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--coffee-soft)',
                                    cursor: 'pointer',
                                    padding: '5px'
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem', textAlign: 'right', paddingRight: '5px' }}>
                        <a href="#" style={{ color: 'var(--coffee-muted)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 700, opacity: 0.8 }}>Forgot Password?</a>
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                        <button type="submit" className="btn-premium" style={{ width: '100%', fontSize: '1rem', padding: '12px', borderRadius: '50px' }}>
                            Log In to UniCafé <ArrowRight size={20} style={{ marginLeft: '10px' }} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--latte-border)' }}></div>
                        <span style={{ color: 'var(--coffee-soft)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px' }}>SECURE ACCESS</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--latte-border)' }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.2rem', marginBottom: '1rem' }}>
                        {[
                            { icon: <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"/></svg>, bg: '#fff', border: 'var(--latte-border)', shadow: '0 4px 15px rgba(59,31,14,0.06)' },
                            { icon: <Facebook size={26} color="white" fill="white" />, bg: '#1877F2', shadow: '0 8px 20px rgba(24, 119, 242, 0.25)' },
                            { icon: <Instagram size={26} color="white" />, bg: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', shadow: '0 8px 20px rgba(214, 36, 159, 0.25)' }
                        ].map((social, i) => (
                            <motion.div 
                                key={i}
                                whileHover={{ y: -4, scale: 1.05 }}
                                style={{ 
                                    width: '50px', 
                                    height: '50px', 
                                    borderRadius: '14px', 
                                    background: social.bg, 
                                    border: social.border ? `1px solid ${social.border}` : 'none',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    cursor: 'pointer',
                                    boxShadow: social.shadow
                                }}
                            >
                                {social.icon}
                            </motion.div>
                        ))}
                    </div>

                    <p style={{ textAlign: 'center', color: 'var(--coffee-muted)', opacity: 0.9, fontSize: '0.88rem', margin: '0.8rem 0 0 0', fontWeight: 600 }}>
                        Don't have an account? <Link to="/signup" style={{ color: 'var(--coffee-dark)', fontWeight: 800 }}>Sign up</Link>
                    </p>
                    <p style={{ textAlign: 'center', margin: '1rem 0 0 0' }}>
                        <Link to="/" style={{ color: 'var(--coffee-dark)', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            Continue as Guest <ArrowRight size={16} />
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default LoginPage;
