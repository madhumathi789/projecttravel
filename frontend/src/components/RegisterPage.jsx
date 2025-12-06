import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api"; 
import "./login.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/register", {
        username: name,
        email,
        password,
      });

      if (res.status === 201 || res.status === 200) {
        alert("Registered successfully!");
        navigate("/"); // <<< Go to LOGIN PAGE
      }
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="left-section">
        <img src="/Frame_228.png" alt="Register Illustration" className="illustration" />
      </div>

      <div className="right-section">
        <div className="form-container">
          <h2 className="form-title">Register</h2>

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                className="input-box"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="input-box"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="input-box"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>

            <p className="register-text">
              Already have an account?{" "}
              <Link to="/" className="register-link">
                Login now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
