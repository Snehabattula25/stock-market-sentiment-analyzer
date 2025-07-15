import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import HomePage from "./pages/HomePage";
import LiveStockPage from "./pages/LiveStockPage";
import SearchStock from "./pages/SearchStock";
import Recommendation from "./components/Recommendation"; // ✅ Import the recommendation component

// ✅ Import Bootstrap styles globally
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router>
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/live-stocks" element={<LiveStockPage />} />
          <Route path="/search-stock" element={<SearchStock />} />
          <Route path="/recommendation" element={<Recommendation />} /> {/* ✅ New route for recommendation */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
