import React, { useState } from "react";
import axios from "axios";
import API_URL from "../config";
import "./ForgotPassword.css";
import { FiMail, FiArrowLeft, FiSend, FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      
      if (response.data.success) {
        setSuccess(true);
        setEmail("");
      } else {
        setError(response.data.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.response?.data?.message || "Unable to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      {/* Left Side - Brand Section */}
      <div className="forgot-brand">
        <div className="brand-overlay"></div>
        <div className="brand-content">
          <div className="brand-logo">
            <svg className="brand-logo-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="url(#forgotLogoGradient)"/>
              <defs>
                <linearGradient id="forgotLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
            <h2>Reset Your <span className="gradient-text">Password</span></h2>
            <p>
              Don't worry! We'll send you a reset link to your email address.
              Follow the instructions to create a new password.
            </p>
          </div>
          
          <div className="brand-features">
            <div className="feature-item">
              <FiCheckCircle size={18} />
              <span>Secure password reset</span>
            </div>
            <div className="feature-item">
              <FiCheckCircle size={18} />
              <span>Link expires in 1 hour</span>
            </div>
            <div className="feature-item">
              <FiCheckCircle size={18} />
              <span>Immediate email delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="forgot-form-container">
        <div className="form-wrapper">
          <Link to="/login" className="back-to-login">
            <FiArrowLeft size={16} />
            Back to Login
          </Link>

          <div className="form-header">
            <h2>Forgot Password?</h2>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          {success ? (
            <div className="success-message">
              <FiSend size={48} />
              <h3>Check Your Email</h3>
              <p>
                We've sent a password reset link to your email address.
                The link will expire in 1 hour.
              </p>
              <Link to="/login" className="back-to-login-btn">
                Return to Login
              </Link>
            </div>
          ) : (
            <form className="forgot-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label>
                  <FiMail size={16} />
                  Email Address
                </label>
                <div className={`input-field ${emailFocused ? "focused" : ""} ${error ? "error" : ""}`}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="name@company.com"
                    disabled={loading}
                  />
                </div>
                {error && <span className="error-message">{error}</span>}
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <FiSend size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;