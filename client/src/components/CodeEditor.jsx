import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, onChange, language = 'sql' }) => {
    const handleEditorChange = (value) => {
        onChange(value);
    };

    return (
        <div className="editor-container" style={{ height: '100%', borderRadius: '8px', overflow: 'hidden' }}>
            <Editor
                height="100%"
                defaultLanguage={language}
                defaultValue={code}
                value={code}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    padding: { top: 16 }
                }}
            />
        </div>
    );
};

export default CodeEditor;
