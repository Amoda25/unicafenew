import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, CheckCircle, Eye, EyeOff, Facebook, Instagram } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import heroBg from '../assets/hero_bg.png';
import campusBg from '../assets/campus_bg.png';
import unicafeLogo from '../assets/unicafe_logo_vintage.png';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'student'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });
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
                navigate('/');
                window.location.reload();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Google signup failed');
        }
    };

    const validatePassword = (pass) => {
        setPasswordRequirements({
            length: pass.length >= 8,
            uppercase: /[A-Z]/.test(pass),
            lowercase: /[a-z]/.test(pass),
            number: /[0-9]/.test(pass),
            special: /[^A-Za-z0-9]/.test(pass)
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'password') {
            validatePassword(value);
        }
    };

    const validateStudentId = (id) => {
        // Regex for Student ID: at least 2 letters followed by at least 5 digits
        const studentIdRegex = /^[A-Za-z]{2,}\d{5,}$/;
        return studentIdRegex.test(id);
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.role === 'student' && !validateStudentId(formData.username)) {
            setError('Invalid Student ID. Use letters followed by digits (e.g., IT123456).');
            return window.scrollTo(0, 0);
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return window.scrollTo(0, 0);
        }

        const isPasswordValid = Object.values(passwordRequirements).every(req => req);
        if (!isPasswordValid) {
            setError('Please meet all password requirements');
            return window.scrollTo(0, 0);
        }

        try {
            await axios.post('/api/auth/register', {
                name: formData.name,
                username: formData.username,
                password: formData.password,
                role: formData.role
            });
            console.log('Registration success');
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            console.error('Registration Error:', err);
            const msg = err.response?.data?.message || err.message || 'Registration failed';
            setError(msg);
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
                        <div style={{ fontSize: '1rem' }}>Signup Successful!</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Welcome to the UniCafé family!</div>
                    </div>
                </motion.div>
            )}

            {/* Left Side text */}
            <div style={{ flex: '1 1 450px', paddingRight: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.6rem', zIndex: 1, marginTop: '-5rem' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{
                        width: '140px',
                        height: '110px',
                        overflow: 'visible',
                        filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.12))',
                        marginBottom: '1.2rem',
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
                    Join the UniCafé Community. <br/>Fuel Your Academic Journey.
                </motion.p>
                <div style={{ height: '6px', width: '100px', background: 'var(--coffee-dark)', borderRadius: '5px', marginTop: '1.5rem', opacity: 0.8 }}></div>
            </div>

            {/* Right Side Form */}
            <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                    flex: '0 1 500px',
                    width: '100%',
                    padding: '1.6rem 1.8rem',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '32px',
                    boxShadow: '0 30px 80px rgba(59, 31, 14, 0.12)',
                    zIndex: 1
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--latte-border)', paddingBottom: '1rem', marginBottom: '1.2rem' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, color: 'var(--coffee-dark)', letterSpacing: '-1px' }}>Sign Up</h2>
                    <Link to="/login" style={{ 
                        color: 'var(--coffee-muted)', 
                        textDecoration: 'none', 
                        fontSize: '0.9rem', 
                        fontWeight: 800,
                        padding: '8px 20px',
                        borderRadius: '25px',
                        background: 'rgba(59, 31, 14, 0.05)',
                        transition: 'all 0.25s ease'
                    }}>Log In</Link>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ background: '#fef2f2', color: '#991b1b', padding: '0.8rem 1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #fee2e2', fontSize: '0.85rem', fontWeight: 700 }}>
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSignup}>
                    {/* Full Name + Student ID side by side */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.9rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--coffee-dark)', fontWeight: 800, marginBottom: '0.4rem', marginLeft: '5px' }}>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your Full Name"
                                className="glass-input"
                                style={{ background: '#fff', border: '1px solid var(--latte-border)', borderRadius: '12px', fontSize: '0.88rem', padding: '10px 13px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--coffee-dark)', fontWeight: 800, marginBottom: '0.4rem', marginLeft: '5px' }}>
                                {formData.role === 'student' ? 'Student ID' : 'Username'}
                            </label>
                            <input
                                type="text"
                                name="username"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                placeholder={formData.role === 'student' ? "e.g. STU12345" : "e.g. johndoe123"}
                                className="glass-input"
                                style={{ background: '#fff', border: '1px solid var(--latte-border)', borderRadius: '12px', fontSize: '0.88rem', padding: '10px 13px' }}
                            />
                        </div>
                    </div>

                    {/* Role selector - horizontal inline */}
                    <div style={{ marginBottom: '0.9rem' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--coffee-dark)', fontWeight: 800, marginBottom: '0.4rem', marginLeft: '5px' }}>Are you a...</label>
                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                            {[
                                { id: 'student', label: 'Student', icon: <User size={16} /> },
                                { id: 'staff', label: 'Staff', icon: <Lock size={16} /> }
                            ].map((role) => (
                                <motion.div 
                                    key={role.id}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setFormData({ ...formData, role: role.id })}
                                    style={{
                                        flex: 1,
                                        padding: '0.55rem 1rem',
                                        background: formData.role === role.id ? 'var(--latte-bg)' : '#fff',
                                        border: `2px solid ${formData.role === role.id ? 'var(--coffee-dark)' : 'var(--latte-border)'}`,
                                        borderRadius: '14px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        color: formData.role === role.id ? 'var(--coffee-dark)' : 'var(--coffee-soft)',
                                        transition: 'all 0.2s ease',
                                        fontWeight: 800,
                                        fontSize: '0.88rem',
                                        boxShadow: formData.role === role.id ? '0 6px 14px rgba(59, 31, 14, 0.08)' : 'none'
                                    }}
                                >
                                    {role.icon}
                                    <span>{role.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--coffee-dark)', fontWeight: 800, marginBottom: '0.4rem', marginLeft: '5px' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="glass-input"
                                    style={{ paddingRight: '45px', background: '#fff', border: '1px solid var(--latte-border)', borderRadius: '14px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--coffee-soft)',
                                        cursor: 'pointer',
                                        padding: '5px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--coffee-dark)', fontWeight: 800, marginBottom: '0.4rem', marginLeft: '5px' }}>Confirm</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="glass-input"
                                    style={{ paddingRight: '45px', background: '#fff', border: '1px solid var(--latte-border)', borderRadius: '14px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--coffee-soft)',
                                        cursor: 'pointer',
                                        padding: '5px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Password Requirements Checklist - compact single row */}
                    <div style={{ 
                        background: 'var(--latte-bg)', 
                        padding: '0.6rem 1rem', 
                        borderRadius: '12px', 
                        marginBottom: '1rem',
                        fontSize: '0.78rem',
                        border: '1px solid var(--latte-border)'
                    }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--coffee-dark)', fontWeight: 800, fontSize: '0.78rem', opacity: 0.8, flexShrink: 0 }}>Requirements:</span>
                            {[
                                { key: 'length', text: '8+ chars' },
                                { key: 'uppercase', text: 'A-Z' },
                                { key: 'lowercase', text: 'a-z' },
                                { key: 'number', text: '0-9' },
                                { key: 'special', text: '!@#' }
                            ].map(req => (
                                <div key={req.key} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '4px',
                                    color: passwordRequirements[req.key] ? '#059669' : 'var(--coffee-soft)',
                                    fontWeight: passwordRequirements[req.key] ? 800 : 500,
                                    transition: 'all 0.3s ease'
                                }}>
                                    <CheckCircle size={11} style={{ opacity: passwordRequirements[req.key] ? 1 : 0.3 }} />
                                    {req.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <button type="submit" className="btn-premium" style={{ width: '100%', fontSize: '1rem', padding: '12px', borderRadius: '50px' }}>
                            Create Account <ArrowRight size={20} style={{ marginLeft: '10px' }} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--latte-border)' }}></div>
                        <span style={{ color: 'var(--coffee-soft)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px' }}>OR JOIN WITH</span>
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

                    <p style={{ textAlign: 'center', color: 'var(--coffee-muted)', opacity: 0.9, fontSize: '0.88rem', margin: '0.5rem 0 0 0', fontWeight: 600 }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--coffee-dark)', fontWeight: 800 }}>Login</Link>
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

export default SignupPage;
