import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages Placeholder
const Home = () => <div className="p-4"><h1>Home Page</h1></div>;
const Workspace = () => <div className="p-4"><h1>Workspace</h1></div>;

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/workspace/:id" element={<Workspace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
