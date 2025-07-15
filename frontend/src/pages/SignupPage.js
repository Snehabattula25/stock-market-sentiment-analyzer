import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css"; // Reuse same styling

function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:5000/register", {
        username,
        password
      });
      alert(response.data.message);
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert("Username already exists!");
      } else {
        alert("Signup failed!");
      }
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Signup</h2>
      <form onSubmit={handleSignup} className="login-form">
        <input
          type="text"
          placeholder="Choose a Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Choose a Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Signup</button>
        <p style={{ marginTop: "15px" }}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "blue", cursor: "pointer" }}
          >
            Login here
          </span>
        </p>
      </form>
    </div>
  );
}

export default SignupPage;
