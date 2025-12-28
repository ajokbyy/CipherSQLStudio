import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

    // Sync state with URL if it changes externally
    useEffect(() => {
        setSearchTerm(searchParams.get('q') || '');
    }, [searchParams]);

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        // Update URL params
        if (term) {
            setSearchParams({ q: term });
        } else {
            setSearchParams({});
        }
    };

    const iconColor = theme === 'dark' ? '#aaa' : '#555';

    return (
        <nav style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            transition: 'background 0.3s, color 0.3s'
        }}>
            {/* Left Section: Menu, Logo, Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>


                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: '32px' }} />
                    <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>CipherSchools</span>
                </Link>


            </div>

            {/* Middle Section: Search Bar */}
            <div style={{ flex: 1, maxWidth: '600px', margin: '0 2rem' }}>
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search and Learn"
                        value={searchTerm}
                        onChange={handleSearch}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--text-primary)',
                            paddingLeft: '0.75rem',
                            fontSize: '0.95rem'
                        }}
                    />
                </div>
            </div>

            {/* Right Section: Notification, Profile, Points, Theme */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>


                {/* Profile / Login */}
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontWeight: 'bold' }}>
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{user.username}</span>
                        </div>
                        <button onClick={logout} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)' }}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="btn" style={{ background: 'var(--accent-primary)', color: '#fff', textDecoration: 'none', padding: '0.5rem 1rem' }}>
                        Login
                    </Link>
                )}



                {/* Theme Toggle */}
                <button onClick={toggleTheme} className="btn" style={{ padding: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', color: iconColor }}>
                    {theme === 'dark' ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    )}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
