import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import CodeEditor from '../components/CodeEditor';
import ResultsTable from '../components/ResultsTable';

const Workspace = () => {
    const { id } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [code, setCode] = useState('');
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [hint, setHint] = useState(null);

    useEffect(() => {
        axios.get(`/api/assignments/${id}`)
            .then(res => {
                setAssignment(res.data);
                setCode(res.data.defaultCode || '-- Write query here');
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const runQuery = async () => {
        setExecuting(true);
        setError(null);
        setResults(null);
        try {
            const res = await axios.post('/api/execute', {
                code,
                assignmentId: id
            });
            setResults(res.data);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setExecuting(false);
        }
    };

    const getHint = async () => {
        try {
            const res = await axios.post('/api/hints', {
                code,
                assignmentId: id,
                context: assignment.description
            });
            setHint(res.data.hint);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-4">Loading Workspace...</div>;
    if (!assignment) return <div className="p-4">Assignment not found</div>;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ flex: 1, display: 'flex', padding: '0 1rem 1rem', gap: '1rem', overflow: 'hidden' }}>

                {/* Left Panel: Problem Description */}
                <div className="glass-panel" style={{ flex: '0 0 35%', display: 'flex', flexDirection: 'column', padding: '1.5rem', overflowY: 'auto' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{assignment.title}</h2>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Difficulty: {assignment.difficulty}</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem', lineHeight: '1.7' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Problem Description</h3>
                        <p>{assignment.description}</p>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        {!hint ? (
                            <button onClick={getHint} className="btn" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', width: '100%' }}>
                                Need a Hint? (AI)
                            </button>
                        ) : (
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <strong style={{ color: 'var(--success)', display: 'block', marginBottom: '0.5rem' }}>AI Hint:</strong>
                                {hint}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Editor & Results */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Editor Area */}
                    <div className="glass-panel" style={{ flex: '1', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>SQL Editor</span>
                            <button onClick={runQuery} disabled={executing} className="btn btn-primary">
                                {executing ? 'Running...' : 'Run Query ▶'}
                            </button>
                        </div>
                        <div style={{ flex: 1 }}>
                            <CodeEditor code={code} onChange={setCode} />
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="glass-panel" style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Query Results</span>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
                            <ResultsTable results={results} error={error} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Workspace;
