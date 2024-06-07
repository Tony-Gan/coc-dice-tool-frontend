import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    const goToDiceTool = () => {
        navigate('/dice');
    };

    const showComingSoon = () => {
        alert('功能在开发中');
    };

    return (
        <div className="home-container">
            <h1>主界面</h1>
            <div className="button-container">
                <button onClick={goToDiceTool} className="btn">骰子工具</button>
                <button onClick={showComingSoon} className="btn">功能二</button>
                <button onClick={showComingSoon} className="btn">功能三</button>
            </div>
        </div>
    );
};

export default Home;
