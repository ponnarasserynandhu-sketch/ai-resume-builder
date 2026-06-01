import React, { useState } from "react";
import axios from "axios";
import API_URL from '../config';
import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiCpu,
  FiTrendingUp,
  FiAward,
  FiStar
} from "react-icons/fi";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [focusedField, setFocusedField] = useState(null);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    const newPassword = e.target.value;
    setForm({ ...form, password: newPassword });
    checkPasswordStrength(newPassword);
  };

  // Submit handler - Using API_URL
  const submit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Using API_URL for dynamic backend URL
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        }),
      });

      const data = await response.json();
      console.log("Signup response:", data);

      if (data.success) {
        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Show success message
        const successMessage = document.createElement("div");
        successMessage.className = "success-toast";
        successMessage.innerHTML = "✨ Account created successfully! Redirecting...";
        document.body.appendChild(successMessage);

        setTimeout(() => {
          successMessage.remove();
          navigate("/dashboard");
        }, 1500);
      } else {
        throw new Error(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = document.createElement("div");
      errorMessage.className = "error-toast";
      errorMessage.innerHTML = error.message || "Signup failed. Please try again.";
      document.body.appendChild(errorMessage);

      setTimeout(() => {
        errorMessage.remove();
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicators
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

  const features = [
    { icon: FiCpu, text: "AI-Powered Resume Generation" },
    { icon: FiTrendingUp, text: "ATS-Optimized Templates" },
    { icon: FiAward, text: "Professional Portfolio" },
    { icon: FiStar, text: "Expert Tips & Guidance" }
  ];

  return (
    <div className="signup-page">
      {/* Left Side - Brand Section */}
      <div className="signup-brand">
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
            <h2>Start Your Journey to</h2>
            <h2 className="gradient-text">Career Success</h2>
            <p>Join thousands of professionals who landed their dream jobs with our AI-powered platform</p>
          </div>

          <div className="brand-features">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-item">
                  <Icon size={18} />
                  <span>{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="signup-form-container">
        <div className="form-wrapper">
          <div className="form-header">
            <h2>Create an Account</h2>
          </div>

          <form className="signup-form" onSubmit={submit}>
            {/* Name Field */}
            <div className="input-group">
              <label>
                <FiUser size={16} />
                Full Name
              </label>
              <div className={`input-field ${focusedField === "name" ? "focused" : ""} ${errors.name ? "error" : ""}`}>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            {/* Email Field */}
            <div className="input-group">
              <label>
                <FiMail size={16} />
                Email Address
              </label>
              <div className={`input-field ${focusedField === "email" ? "focused" : ""} ${errors.email ? "error" : ""}`}>
                <input
                  type="email"
                  placeholder="hello@example.com"
                  value={form.email}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* Password Field */}
            <div className="input-group">
              <label>
                <FiLock size={16} />
                Password
              </label>
              <div className={`input-field ${focusedField === "password" ? "focused" : ""} ${errors.password ? "error" : ""}`}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={form.password}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  onChange={handlePasswordChange}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              
              {form.password && (
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
              
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <FiArrowRight size={18} />
                </>
              )}
            </button>

            <div className="login-link">
              <p>Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;