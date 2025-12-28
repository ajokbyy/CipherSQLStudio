import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    useEffect(() => {
        axios.get('/api/assignments')
            .then(res => {
                // Enrich with mock data for UI demo
                const enriched = res.data.map(a => ({
                    ...a,
                    acceptance: (Math.random() * (80 - 30) + 30).toFixed(1)
                }));

                // Sort by difficulty: Easy -> Medium -> Hard
                const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
                enriched.sort((a, b) => (difficultyOrder[a.difficulty] || 99) - (difficultyOrder[b.difficulty] || 99));

                setAssignments(enriched);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'Hard': return '#ef4444'; // Red
            case 'Medium': return '#eab308'; // Yellow/Orange
            case 'Easy': return '#00b8a3'; // Cyan/Green
            default: return '#fff';
        }
    };

    const filteredAssignments = assignments.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <Navbar />

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem', width: '100%' }}>

                {/* Header / Stats */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {/* Search bar removed */}
                        {/* Search and Settings removed */}
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', color: '#888', fontSize: '0.9rem' }}>
                        {/* Removed Total Questions and Shuffle */}
                    </div>
                </div>

                {/* List Container */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>

                    {/* List Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 100px 100px 50px', padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <div>Status</div>
                        <div>Title</div>
                        <div>Acceptance</div>
                        <div>Difficulty</div>
                        <div></div>
                    </div>

                    {/* Loading State */}
                    {loading && <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading questions...</div>}

                    {/* Questions List */}
                    {!loading && filteredAssignments.map((ass, index) => (
                        <div
                            key={ass._id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '50px 1fr 100px 100px 50px',
                                padding: '1rem',
                                alignItems: 'center',
                                background: index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                                borderBottom: '1px solid var(--border-color)'
                            }}
                        >
                            {/* Status */}
                            <div style={{ fontSize: '1.2rem', color: '#00b8a3' }}>

                            </div>

                            {/* Title */}
                            <div>
                                <Link
                                    to={`/workspace/${ass._id}`}
                                    style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '500' }}
                                    onMouseOver={(e) => e.target.style.color = 'var(--accent-primary)'}
                                    onMouseOut={(e) => e.target.style.color = 'var(--text-primary)'}
                                >
                                    {index + 1}. {ass.title}
                                </Link>
                            </div>

                            {/* Acceptance */}
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                {ass.acceptance}%
                            </div>

                            {/* Difficulty */}
                            <div style={{ color: getDifficultyColor(ass.difficulty), fontWeight: '500', fontSize: '0.9rem' }}>
                                {ass.difficulty === 'Medium' ? 'Med.' : ass.difficulty}
                            </div>

                            {/* Lock/Status */}
                            <div style={{ color: '#888', fontSize: '0.8rem' }}>

                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
};

export default Home;
