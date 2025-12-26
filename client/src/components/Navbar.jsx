import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="glass-panel" style={{
            margin: '1rem',
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '16px'
        }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '2rem', height: '2rem', background: 'var(--accent-primary)', borderRadius: '8px' }}></div>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>CipherSQL</span>
            </Link>
            <div>
                {/* Placeholder for user profile or settings */}
            </div>
        </nav>
    );
};

export default Navbar;
