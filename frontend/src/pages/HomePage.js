import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="container text-center mt-5">
      <h1 className="mb-4">📈 Stock Sentiment Analyzer</h1>
      <p className="lead">
        Welcome! This platform provides real-time stock sentiment analysis and smart recommendations based on live data.
      </p>

      <div className="d-flex justify-content-center mt-4">
        <button className="btn btn-primary mx-2" onClick={() => navigate("/login")}>
          Login
        </button>
        <button className="btn btn-outline-primary mx-2" onClick={() => navigate("/register")}>
          Register
        </button>
      </div>
    </div>
  );
}

export default HomePage;
