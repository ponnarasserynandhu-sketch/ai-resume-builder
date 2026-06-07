import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "../config";
import "./ResetPassword.css";
import { 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiCheckCircle, 
  FiAlertCircle,
  FiArrowLeft 
} from "react-icons/fi";
import { Link } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  useEffect(() => {
    // Get token from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const resetToken = queryParams.get("token");
    
    if (resetToken) {
      setToken(resetToken);
    } else {
      setError("Invalid or missing reset token");
    }
  }, [location]);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e) => {
    const newPwd = e.target.value;
    setNewPassword(newPwd);
    checkPasswordStrength(newPwd);
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "Very Weak";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "#ef4444";
    if (passwordStrength === 1) return "#f97316";
    if (passwordStrength === 2) return "#eab308";
    if (passwordStrength === 3) return "#06d6a0";
    return "#10b981";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        newPassword
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(response.data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.response?.data?.message || "Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      {/* Left Side - Brand Section */}
      <div className="reset-brand">
        <div className="brand-overlay"></div>
        <div className="brand-content">
          <div className="brand-logo">
            <svg className="brand-logo-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="url(#resetLogoGradient)"/>
              <defs>
                <linearGradient id="resetLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
            <h2>Create New <span className="gradient-text">Password</span></h2>
            <p>
              Your new password must be different from previously used passwords
              and should be at least 6 characters long.
            </p>
          </div>
          
          <div className="brand-features">
            <div className="feature-item">
              <FiCheckCircle size={18} />
              <span>Minimum 6 characters</span>
            </div>
            <div className="feature-item">
              <FiCheckCircle size={18} />
              <span>Include uppercase & lowercase</span>
            </div>
            <div className="feature-item">
              <FiCheckCircle size={18} />
              <span>Add numbers & special chars</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="reset-form-container">
        <div className="form-wrapper">
          <Link to="/login" className="back-to-login">
            <FiArrowLeft size={16} />
            Back to Login
          </Link>

          <div className="form-header">
            <h2>Reset Password</h2>
            <p>Enter your new password below</p>
          </div>

          {success ? (
            <div className="success-message">
              <FiCheckCircle size={48} />
              <h3>Password Reset Successfully!</h3>
              <p>
                Your password has been changed successfully.
                Redirecting you to login page...
              </p>
              <Link to="/login" className="back-to-login-btn">
                Go to Login
              </Link>
            </div>
          ) : (
            <form className="reset-form" onSubmit={handleSubmit}>
              {error && (
                <div className="error-alert">
                  <FiAlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* New Password Field */}
              <div className="input-group">
                <label>
                  <FiLock size={16} />
                  New Password
                </label>
                <div className={`input-field ${newPasswordFocused ? "focused" : ""}`}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={handlePasswordChange}
                    onFocus={() => setNewPasswordFocused(true)}
                    onBlur={() => setNewPasswordFocused(false)}
                    placeholder="Enter new password"
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
                
                {newPassword && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-progress"
                        style={{ 
                          width: `${(passwordStrength / 5) * 100}%`,
                          backgroundColor: getPasswordStrengthColor()
                        }}
                      />
                    </div>
                    <div className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                      {getPasswordStrengthText()} password
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="input-group">
                <label>
                  <FiLock size={16} />
                  Confirm Password
                </label>
                <div className={`input-field ${confirmPasswordFocused ? "focused" : ""}`}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                    placeholder="Confirm your new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Resetting Password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <FiCheckCircle size={18} />
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

export default ResetPassword;