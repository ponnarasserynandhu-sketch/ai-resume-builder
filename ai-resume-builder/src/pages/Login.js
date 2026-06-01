import React, { useState } from "react";
import axios from "axios";
import API_URL from '../config';
import "./Login.css";
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiShield } from "react-icons/fi";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Debug log to check API_URL
    console.log("API_URL:", API_URL);
    console.log("Login attempt with:", { email, showAdminLogin });

    try {
      const endpoint = `${API_URL}/api/auth/login`;
      console.log("Calling endpoint:", endpoint);

      const res = await axios.post(endpoint, {
        email,
        password
      });

      console.log("Response:", res.data);

      if (res.data.success) {
        const userRole = res.data.user.role;
        
        // Check if trying to login as admin but user is not admin
        if (showAdminLogin && userRole !== "admin") {
          setError("Invalid admin credentials. Please use admin login.");
          setLoading(false);
          return;
        }
        
        // Check if trying to login as user but user is admin
        if (!showAdminLogin && userRole === "admin") {
          setError("This is an admin account. Please use Admin Login tab.");
          setLoading(false);
          return;
        }

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userRole", res.data.user.role);
        localStorage.setItem("user", JSON.stringify({
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role
        }));
        
        // Redirect based on user role
        if (res.data.user.role === "admin") {
          window.location.href = "/admin-dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response);
      
      let errorMessage = "Something went wrong. Please try again.";
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request was made but no response
        errorMessage = "Cannot connect to server. Please check your connection.";
        console.error("No response received:", err.request);
      } else {
        // Something else happened
        errorMessage = err.message || "An error occurred";
      }
      
      // Custom error messages based on context
      if (showAdminLogin && errorMessage.includes("Invalid credentials")) {
        errorMessage = "Invalid admin credentials.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset form when toggling between user and admin login
  const handleToggleChange = (isAdmin) => {
    setShowAdminLogin(isAdmin);
    setEmail("");
    setPassword("");
    setError("");
    setEmailFocused(false);
    setPasswordFocused(false);
  };

  return (
    <div className="login-page">
      {/* LEFT SIDE - BRAND SECTION */}
      <div className="login-brand">
        <div className="brand-overlay"></div>
        <div className="brand-content">
          <div className="brand-logo">
            <svg className="brand-logo-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="url(#loginLogoGradient)"/>
              <defs>
                <linearGradient id="loginLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
              <path d="M12 15L20 10L28 15V25L20 30L12 25V15Z" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M20 20V30M12 15L20 20L28 15" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <circle cx="20" cy="20" r="2" fill="white"/>
            </svg>
            <div className="brand-text">
              <span className="brand-name">AI Resume</span>
              <span className="brand-tagline">Builder</span>
            </div>
          </div>
          
          <div className="brand-message">
            <h2>
              Welcome Back to <span className="gradient-text">AI Resume</span>
            </h2>
            <p>
              Sign in to continue your journey with our AI-powered resume builder. 
              Create professional resumes and portfolios that help you land your dream job.
            </p>
          </div>
          
          <div className="brand-features">
            <div className="feature-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>AI-Powered Resume Building</span>
            </div>
            <div className="feature-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Professional Templates</span>
            </div>
            <div className="feature-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>ATS-Friendly Format</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM SECTION */}
      <div className="login-form-container">
        <div className="form-wrapper">
          <div className="form-header">
            <h2>{showAdminLogin ? "Admin Sign In" : "Sign In"}</h2>
            <p>
              {showAdminLogin 
                ? "Admin access only. Please enter your admin credentials." 
                : "Welcome back! Please enter your credentials"}
            </p>
          </div>

          {/* Toggle between User Login and Admin Login */}
          <div className="login-type-toggle">
            <button 
              className={`toggle-btn ${!showAdminLogin ? 'active' : ''}`}
              onClick={() => handleToggleChange(false)}
            >
              User Login
            </button>
            <button 
              className={`toggle-btn ${showAdminLogin ? 'active' : ''}`}
              onClick={() => handleToggleChange(true)}
            >
              <FiShield /> Admin Login
            </button>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label>
                <FiMail size={16} />
                Email Address
              </label>
              <div className={`input-field ${emailFocused ? 'focused' : ''} ${error ? 'error' : ''}`}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder={showAdminLogin ? "admin@example.com" : "name@company.com"}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="input-group">
              <label>
                <FiLock size={16} />
                Password
              </label>
              <div className={`input-field ${passwordFocused ? 'focused' : ''}`}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder={showAdminLogin ? "Enter admin password" : "Enter your password"}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {!showAdminLogin && (
              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="/forgot-password" className="forgot-link">Forgot password?</a>
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  {showAdminLogin ? "Admin Sign In" : "Sign In"}
                  <FiArrowRight size={18} />
                </>
              )}
            </button>

            {!showAdminLogin && (
              <div className="login-link">
                <p>Don't have an account? <a href="/signup">Create account</a></p>
              </div>
            )}
          </form>

          {/* Admin Info Message */}
          {showAdminLogin && (
            <div className="admin-info-message">
              <p>🔐 Admin login is restricted to authorized personnel only.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;