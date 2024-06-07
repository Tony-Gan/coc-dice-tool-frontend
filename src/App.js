// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DiceTool from './components/DiceTool';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<DiceTool />} />
            </Routes>
        </Router>
    );
};

export default App;
