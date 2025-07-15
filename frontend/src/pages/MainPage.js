import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">📈 Welcome to Stock Sentiment Analyzer</h1>
      <p className="home-subtitle">Analyze stock sentiments and make smarter decisions!</p>
      
      <div className="home-buttons">
        <button onClick={() => navigate("/login")}>Login</button>
        <button onClick={() => navigate("/signup")}>Sign Up</button>
      </div>
    </div>
  );
}

export default MainPage;
