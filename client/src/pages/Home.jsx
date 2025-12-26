import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, fetch from backend. 
        // For demo purposes if backend isn't connected, we might want fallback?
        // But let's assume valid backend.
        axios.get('/api/assignments')
            .then(res => {
                setAssignments(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <>
            <Navbar />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #3b82f6, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        CipherSQL Studio
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        Master SQL in a safe, interactive sandbox with AI-powered guidance.
                    </p>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center' }}>Loading assignments...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {assignments.map(ass => (
                            <div key={ass._id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '1.5rem' }}>{ass.title}</h3>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        background: ass.difficulty === 'Hard' ? 'rgba(239, 68, 68, 0.2)' : ass.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                        color: ass.difficulty === 'Hard' ? '#fca5a5' : ass.difficulty === 'Medium' ? '#fcd34d' : '#6ee7b7'
                                    }}>
                                        {ass.difficulty}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', flex: 1 }}>{ass.description.substring(0, 100)}...</p>
                                <Link to={`/workspace/${ass._id}`} className="btn btn-primary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                                    Solve Challenge
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Home;
