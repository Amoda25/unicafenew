import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
    return (
        <footer>
            <div className="footer-content">
                <div className="footer-info">
                    <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Coffee style={{ color: '#1F2937' }} size={24} />
                        <h3 style={{ fontWeight: 800, color: '#1F2937' }}>UniCafé</h3>
                    </div>
                    <p style={{ color: '#1F2937', fontWeight: 500, lineHeight: 1.6 }}>
                        Revolutionizing university dining with real-time analytics and predictive technology.
                        Smart ordering and seamless campus integration.
                    </p>
                </div>

                <div className="footer-links">
                    <h4 style={{ marginBottom: '1.5rem', color: '#1F2937' }}>UniCafé</h4>
                    <ul style={{ listStyle: 'none', color: '#1F2937', fontWeight: 500, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li><Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About Us</Link></li>
                        <li><Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Us</Link></li>
                        <li><Link to="/order" style={{ color: 'inherit', textDecoration: 'none' }}>Ordering</Link></li>
                        <li><Link to="/calendar" style={{ color: 'inherit', textDecoration: 'none' }}>Calendar</Link></li>
                    </ul>
                </div>

                <div className="footer-social">
                    <h4 style={{ marginBottom: '1.5rem', color: '#1F2937' }}>Follow Us</h4>
                    <div style={{ display: 'flex', gap: '1rem', color: '#000000' }}>
                        <Facebook size={24} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} />
                        <Instagram size={24} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} />
                        <Twitter size={24} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} />
                    </div>
                </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(31, 41, 55, 0.2)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', color: '#1F2937', fontWeight: 500, fontSize: '0.875rem' }}>
                <p>© 2026 UniCafé University Cafeteria Management. All rights reserved.</p>
                <p>Built for the Future of Dining</p>
            </div>
        </footer>
    );
};

export default Footer;
