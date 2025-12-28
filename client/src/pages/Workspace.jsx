import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CodeEditor from '../components/CodeEditor';
import ResultsTable from '../components/ResultsTable';

const SchemaVisualizer = ({ sql }) => {
    // Simple regex to extract basic table info
    // Matches: CREATE TABLE name ( content )
    const tableRegex = /CREATE TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi;
    const tables = [];
    let match;

    while ((match = tableRegex.exec(sql)) !== null) {
        const tableName = match[1];
        const columnsBlock = match[2];
        const columns = columnsBlock.split(',')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('CONSTRAINT') && !line.startsWith('PRIMARY KEY')) // Basic filtering
            .map(line => {
                const parts = line.split(/\s+/);
                return { name: parts[0], type: parts[1] }; // Very basic parser
            });
        tables.push({ name: tableName, columns });
    }

    if (tables.length === 0) return <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No schema available</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tables.map(table => (
                <div key={table.name} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>{table.name}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {table.columns.map((col, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontFamily: 'var(--font-mono)' }}>{col.name}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{col.type}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const HintItem = ({ index, text }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div style={{ marginBottom: '0.5rem', borderRadius: '4px', overflow: 'hidden' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#f97316' }}>💡</span> <span style={{ fontWeight: '500' }}>Hint {index + 1}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>{isOpen ? '▲' : '▼'}</span>
            </div>
            {isOpen && (
                <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', fontSize: '0.9rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)' }}>
                    {text}
                </div>
            )}
        </div>
    );
};

const TestCaseView = ({ assignment }) => {
    const [activeCase, setActiveCase] = useState(0);

    if (!assignment.examples || assignment.examples.length === 0) {
        return <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No test cases available.</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Case Tabs */}
            <div style={{ display: 'flex', padding: '0.5rem', gap: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                {assignment.examples.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveCase(i)}
                        className="btn"
                        style={{
                            background: activeCase === i ? 'var(--bg-tertiary)' : 'transparent',
                            color: activeCase === i ? 'var(--text-primary)' : 'var(--text-secondary)',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.25rem 0.75rem',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                        }}
                    >
                        Case {i + 1}
                    </button>
                ))}
            </div>

            {/* Case Content */}
            <div style={{ flex: 1, padding: '1rem', overflow: 'auto' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Input:</div>
                <pre style={{
                    background: 'var(--bg-tertiary)',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    margin: '0 0 1rem 0',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'var(--font-mono)'
                }}>
                    {assignment.examples[activeCase].inputText}
                </pre>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Expected Output:</div>
                <pre style={{
                    background: 'var(--bg-tertiary)',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    margin: 0,
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'var(--font-mono)'
                }}>
                    {assignment.examples[activeCase].outputText}
                </pre>
            </div>
        </div>
    );
};

const TestResultView = ({ validation }) => {
    if (!validation) return <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Run code to see results</div>;

    const { status, runtime, userOutput, expectedOutput, error } = validation;
    const isAccepted = status === 'Accepted';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1rem', overflowY: 'auto' }}>
            {/* Status Header */}
            <div style={{ marginBottom: '1.5rem', background: isAccepted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: `4px solid ${isAccepted ? 'var(--success)' : 'var(--error)'}` }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isAccepted ? 'var(--success)' : 'var(--error)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isAccepted ? (
                        <>
                            <span>✅</span> Accepted
                        </>
                    ) : (
                        <>
                            <span>❌</span> {status}
                        </>
                    )}
                </div>
                {runtime !== undefined && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: '2.5rem' }}>Runtime: {runtime} ms</div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', padding: '1rem', borderRadius: '4px', color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                    {error}
                </div>
            )}

            {/* Case Tabs (Simulated One Case for now) */}
            {!error && (
                <>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <button className="btn" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                            <span style={{ color: isAccepted ? 'var(--success)' : 'var(--error)', marginRight: '4px' }}>●</span> Case 1
                        </button>
                        {/* Add more cases if backend supports them */}
                    </div>

                    {/* Input (Placeholder as we don't have exact input data returned yet, maybe show schema?) */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Input</div>
                        <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                            (Standard Database State)
                        </div>
                    </div>

                    {/* Output */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Output</div>
                        <div style={{ background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                            <ResultsTable results={{ rows: userOutput || [], fields: userOutput && userOutput.length > 0 ? Object.keys(userOutput[0]) : [] }} />
                        </div>
                    </div>

                    {/* Expected */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Expected</div>
                        <div style={{ background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                            <ResultsTable results={{ rows: expectedOutput || [], fields: expectedOutput && expectedOutput.length > 0 ? Object.keys(expectedOutput[0]) : [] }} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const Workspace = () => {
    const { id } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [code, setCode] = useState('');
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [hints, setHints] = useState([]);
    const [activeTab, setActiveTab] = useState('testcases'); // 'output', 'testcases', 'result'
    const [validationResult, setValidationResult] = useState(null);
    const { user } = useAuth();

    // Resize state
    const [problemPaneHeight, setProblemPaneHeight] = useState(50); // percentage
    const isDragging = React.useRef(false);

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const res = await axios.get(`/api/assignments/${id}`);
                setAssignment(res.data);

                // Persistence Logic: Load from LocalStorage
                const storageKey = `cipher_autosave_${user?._id || user?.id || 'guest'}_${id}`;
                const savedCode = localStorage.getItem(storageKey);

                if (savedCode) {
                    setCode(savedCode);
                } else {
                    setCode(res.data.defaultCode !== undefined ? res.data.defaultCode : '-- Write query here');
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchAssignment();
    }, [id, user]);

    // Auto-save Code
    useEffect(() => {
        if (!loading && code !== undefined) {
            const storageKey = `cipher_autosave_${user?._id || user?.id || 'guest'}_${id}`;
            localStorage.setItem(storageKey, code);
        }
    }, [code, id, user, loading]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging.current) return;

            // Calculate new percentage based on mouse Y position within the right column
            // We need to find the right column element
            const rightCol = document.getElementById('right-column');
            if (rightCol) {
                const rect = rightCol.getBoundingClientRect();
                const relativeY = e.clientY - rect.top;
                const newHeight = (relativeY / rect.height) * 100;

                // Clamp between 20% and 80%
                if (newHeight > 20 && newHeight < 80) {
                    setProblemPaneHeight(newHeight);
                }
            }
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            document.body.style.cursor = 'default';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const startDrag = () => {
        isDragging.current = true;
        document.body.style.cursor = 'row-resize';
    };

    const runQuery = async () => {
        setExecuting(true);
        setError(null);
        setResults(null);
        setValidationResult(null);
        try {
            const res = await axios.post('/api/execute', {
                code,
                assignmentId: id
            });
            setResults(res.data);

            if (res.data.validation) {
                setValidationResult(res.data.validation);
                setActiveTab('result');
            } else {
                // Fallback if no validation (e.g. no solutionSQL)
                setActiveTab('output');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message;
            setError(errorMsg);
            if (err.response?.data?.validation) {
                setValidationResult(err.response.data.validation);
                setActiveTab('result');
            }
        } finally {
            setExecuting(false);
        }
    };

    const getHints = async () => {
        try {
            const res = await axios.post('/api/hints', {
                code,
                assignmentId: id,
                context: assignment.description
            });
            setHints(res.data.hints || []);
        } catch (err) {
            console.error(err);
        }
    };

    const submitQuery = async () => {
        if (!user) {
            alert('Please login to submit');
            return;
        }
        setSubmitting(true);
        setValidationResult(null);
        try {
            // Save Attempt & Verify in Backend
            const res = await axios.post('/api/attempts', {
                assignmentId: id,
                code
            });

            // Response now contains { attempt, validation }
            const validation = res.data.validation;
            setValidationResult(validation);
            setActiveTab('result'); // Switch to result tab

        } catch (err) {
            console.error(err);
            alert('Submission failed due to server error.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-4">Loading Workspace...</div>;
    if (!assignment) return <div className="p-4">Assignment not found</div>;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <Navbar />

            {/* Main IDE Area */}
            <div style={{ flex: 1, display: 'flex', padding: '0 1rem 1rem', gap: '8px', overflow: 'hidden' }}>

                {/* LEFT: Sidebar (Icons) - Optional/Visual only for now */}
                <div style={{ width: '50px', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', paddingTop: '1rem', borderRight: '1px solid var(--border-color)' }}>
                    <div style={{ width: '32px', height: '32px', background: 'var(--bg-tertiary)', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-primary)' }}>SQL</div>
                    {/* Placeholders for visuals */}

                </div>

                {/* MIDDLE: Code Editor */}
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)' }}>
                    {/* Editor Tab Header */}
                    <div style={{ height: '40px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', height: '100%' }}>
                            <div style={{
                                padding: '0 1.5rem',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '0.9rem',
                                borderTop: '2px solid var(--accent-primary)',
                                height: '100%',
                                borderRight: '1px solid var(--border-color)'
                            }}>
                                main.sql

                            </div>

                        </div>

                        <div style={{ paddingRight: '1rem', display: 'flex', gap: '0.5rem' }}>
                            <button onClick={runQuery} disabled={executing || submitting} className="btn" style={{
                                background: 'transparent',
                                color: 'var(--text-primary)',
                                borderRadius: '4px',
                                padding: '0.25rem 1rem',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                border: '1px solid var(--border-color)',
                                marginRight: '0.5rem'
                            }}>
                                {executing ? 'Running...' : 'Run >'}
                            </button>
                            <button onClick={submitQuery} disabled={executing || submitting} className="btn" style={{
                                background: '#f97316',
                                color: 'white',
                                borderRadius: '4px',
                                padding: '0.5rem 1.5rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                letterSpacing: '0.5px'
                            }}>
                                {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>

                    <div style={{ flex: 1, position: 'relative' }}>
                        <CodeEditor code={code} onChange={setCode} />
                    </div>
                </div>

                {/* RIGHT: Problem & Output */}
                <div id="right-column" style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column', gap: '0px' }}>

                    {/* Top Right: Input / Problem */}
                    <div style={{ height: `${problemPaneHeight}%`, display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                        <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            Problem
                        </div>
                        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{assignment.title}</h2>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{assignment.description}</p>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />

                            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Schema</h3>
                            <SchemaVisualizer sql={assignment.schemaSQL} />

                            {assignment.examples && assignment.examples.length > 0 && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#f97316' }}>Examples</h3>
                                    {assignment.examples.map((ex, i) => (
                                        <div key={i} style={{ marginBottom: '1rem', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '4px' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Input:</div>
                                            <pre style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{ex.inputText}</pre>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0.25rem' }}>Output:</div>
                                            <pre style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{ex.outputText}</pre>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ marginTop: '1rem' }}>
                                {hints.length === 0 ? (
                                    <button onClick={getHints} className="btn" style={{ width: '100%', background: '#333', color: '#f97316', border: '1px solid #f97316' }}>
                                        Get 3 Hints
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {hints.map((h, i) => (
                                            <HintItem key={i} index={i} text={h} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Resizer Handle */}
                    <div
                        onMouseDown={startDrag}
                        style={{
                            height: '8px',
                            cursor: 'row-resize',
                            background: 'var(--bg-tertiary)',
                            borderTop: '1px solid var(--border-color)',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <div style={{ width: '30px', height: '2px', background: '#555', borderRadius: '1px' }}></div>
                    </div>

                    {/* Bottom Right: Output / Test Cases */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                        {/* Main Tabs */}
                        <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                            <div
                                onClick={() => setActiveTab('testcases')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    color: activeTab === 'testcases' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                    background: activeTab === 'testcases' ? 'var(--bg-secondary)' : 'transparent',
                                    borderTop: activeTab === 'testcases' ? '2px solid var(--accent-primary)' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <span style={{ color: activeTab === 'testcases' ? 'var(--success)' : 'var(--text-secondary)' }}>✓</span> Testcase
                            </div>
                            <div
                                onClick={() => setActiveTab('output')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    color: activeTab === 'output' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                    background: activeTab === 'output' ? 'var(--bg-secondary)' : 'transparent',
                                    borderTop: activeTab === 'output' ? '2px solid var(--accent-primary)' : 'none'
                                }}
                            >
                                Output
                            </div>
                            <div
                                onClick={() => setActiveTab('result')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    color: activeTab === 'result' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                    background: activeTab === 'result' ? 'var(--bg-secondary)' : 'transparent',
                                    borderTop: activeTab === 'result' ? '2px solid var(--accent-primary)' : 'none'
                                }}
                            >
                                Test Result
                            </div>
                        </div>

                        <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
                            {activeTab === 'output' && <ResultsTable results={results} error={error} />}
                            {activeTab === 'testcases' && <TestCaseView assignment={assignment} />}
                            {activeTab === 'result' && <TestResultView validation={validationResult} />}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};


export default Workspace;
