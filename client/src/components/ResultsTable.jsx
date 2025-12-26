import React from 'react';

const ResultsTable = ({ results, error }) => {
    if (error) {
        return (
            <div style={{ padding: '1rem', color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                <strong>Error:</strong> {error}
            </div>
        );
    }

    if (!results) {
        return (
            <div style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Run a query to see results
            </div>
        );
    }

    if (results.rows && results.rows.length === 0) {
        return (
            <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                Query executed successfully. No rows returned.
            </div>
        )
    }

    // Handle case where we have rows but they might be objects (SELECT)
    const columns = results.fields || (results.rows.length > 0 ? Object.keys(results.rows[0]) : []);

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col} style={{
                                textAlign: 'left',
                                padding: '0.75rem',
                                borderBottom: '1px solid var(--border-color)',
                                color: 'var(--text-secondary)'
                            }}>
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {results.rows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            {columns.map((col) => (
                                <td key={`${i}-${col}`} style={{ padding: '0.75rem' }}>
                                    {row[col] !== null ? String(row[col]) : <em style={{ color: 'var(--text-secondary)' }}>null</em>}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ResultsTable;
