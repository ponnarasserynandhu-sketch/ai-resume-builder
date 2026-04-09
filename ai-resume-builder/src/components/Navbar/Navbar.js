import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiHome,
  FiStar,
  FiDollarSign,
  FiFileText,
  FiSettings,
  FiHelpCircle,
  FiGrid
} from "react-icons/fi";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // authentication 
  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (token && userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserName(userObj.name || userObj.email?.split('@')[0] || "User");
        setUserEmail(userObj.email || "");
      } catch (error) {
        console.error("Error parsing user data:", error);
        setIsLoggedIn(false);
        setUserName("");
        setUserEmail("");
      }
    } else {
      setIsLoggedIn(false);
      setUserName("");
      setUserEmail("");
    }
  };

  useEffect(() => {
    checkAuthStatus();

    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "user") {
        checkAuthStatus();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  useEffect(() => {
    if (isMenuOpen) {
      closeMenu();
    }
    
  }, [location.pathname, isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    setUserName("");
    setUserEmail("");
    navigate("/");
    if (isMenuOpen) {
      closeMenu();
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = "auto";
  };

  const handleResumeBuilderClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      navigate("/login", { state: { from: "/dashboard", message: "Please sign in to access Resume Builder" } });
    }
  };

  const navLinks = [
    { to: "/", label: "Home", icon: FiHome, exact: true, protected: false },
    { to: "/features", label: "Features", icon: FiStar, exact: false, protected: false },
    { to: "/pricing", label: "Pricing", icon: FiDollarSign, exact: false, protected: false },
    { to: "/dashboard", label: "Resume Builder", icon: FiFileText, exact: false, protected: true }
  ];

  const isActiveLink = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
      <div className="nav-container">
        {/* Logo Section with New Logo */}
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <div className="logo-wrapper">
            <div className="logo-icon">
              <svg className="logo-svg" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="url(#logoGradient)"/>
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1"/>
                    <stop offset="100%" stopColor="#8b5cf6"/>
                  </linearGradient>
                </defs>
                <path d="M10 12L16 8L22 12V20L16 24L10 20V12Z" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <path d="M16 16V24M10 12L16 16L22 12" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <circle cx="16" cy="16" r="1.5" fill="white"/>
              </svg>
            </div>
            <div className="logo-text-container">
              <span className="logo-text">AI Resume</span>
              <span className="logo-subtext">Builder
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="nav-links">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActiveLink(link.to, link.exact);
            
            if (link.protected && !isLoggedIn) {
              return (
                <li key={link.to}>
                  <button 
                    onClick={handleResumeBuilderClick}
                    className={`nav-link nav-link-button ${active ? "active" : ""}`}
                  >
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </button>
                </li>
              );
            }
            
            return (
              <li key={link.to}>
                <Link 
                  to={link.to} 
                  className={`nav-link ${active ? "active" : ""}`}
                  onClick={link.protected && !isLoggedIn ? handleResumeBuilderClick : undefined}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right Section */}
        <div className="nav-right">
          {isLoggedIn ? (
            <div className="user-dropdown" ref={dropdownRef}>
              <button 
                className="user-dropdown-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <div className="user-avatar">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{userName}</span>
                <FiChevronDown className={`dropdown-icon ${isDropdownOpen ? "rotate" : ""}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="dropdown-menu" role="menu">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="dropdown-user-info">
                      <p className="dropdown-user-name">{userName}</p>
                      <p className="dropdown-user-email">{userEmail}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link 
                    to="/profile" 
                    className="dropdown-item" 
                    onClick={() => setIsDropdownOpen(false)}
                    role="menuitem"
                  >
                    <FiUser size={18} />
                    <span>My Profile</span>
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="dropdown-item" 
                    onClick={() => setIsDropdownOpen(false)}
                    role="menuitem"
                  >
                    <FiGrid size={18} />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/settings" 
                    className="dropdown-item" 
                    onClick={() => setIsDropdownOpen(false)}
                    role="menuitem"
                  >
                    <FiSettings size={18} />
                    <span>Settings</span>
                  </Link>
                  <Link 
                    to="/help" 
                    className="dropdown-item" 
                    onClick={() => setIsDropdownOpen(false)}
                    role="menuitem"
                  >
                    <FiHelpCircle size={18} />
                    <span>Help & Support</span>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item logout-item" 
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <FiLogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login">
                <button className="btn-login">Sign In</button>
              </Link>
              <Link to="/signup">
                <button className="btn-signup">Get Started</button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn" 
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${isMenuOpen ? "active" : ""}`} 
        onClick={closeMenu}
        aria-hidden={!isMenuOpen}
      >
        <div 
          className={`mobile-menu ${isMenuOpen ? "active" : ""}`} 
          onClick={(e) => e.stopPropagation()}
          ref={mobileMenuRef}
        >
          <div className="mobile-menu-header">
            <Link to="/" className="mobile-logo" onClick={closeMenu}>
              <div className="logo-icon mobile-logo-icon">
                <svg className="mobile-logo-svg" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="8" fill="url(#mobileLogoGradient)"/>
                  <defs>
                    <linearGradient id="mobileLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1"/>
                      <stop offset="100%" stopColor="#8b5cf6"/>
                    </linearGradient>
                  </defs>
                  <path d="M10 12L16 8L22 12V20L16 24L10 20V12Z" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <path d="M16 16V24M10 12L16 16L22 12" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <circle cx="16" cy="16" r="1.5" fill="white"/>
                </svg>
              </div>
              <div className="logo-text-container">
                <span className="logo-text">ResumeAI</span>
                <span className="logo-subtext">Creator</span>
              </div>
            </Link>
            <button className="close-menu-btn" onClick={closeMenu} aria-label="Close menu">
              <FiX size={24} />
            </button>
          </div>
          
          <ul className="mobile-nav-links">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActiveLink(link.to, link.exact);
              
              if (link.protected && !isLoggedIn) {
                return (
                  <li key={link.to}>
                    <button 
                      onClick={() => {
                        closeMenu();
                        handleResumeBuilderClick();
                      }}
                      className={`mobile-nav-link ${active ? "active" : ""}`}
                    >
                      <Icon size={20} />
                      <span>{link.label}</span>
                    </button>
                  </li>
                );
              }
              
              return (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className={`mobile-nav-link ${active ? "active" : ""}`} 
                    onClick={closeMenu}
                  >
                    <Icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
            
           
            {isLoggedIn && (
              <>
                <li>
                  <Link to="/profile" className="mobile-nav-link" onClick={closeMenu}>
                    <FiUser size={20} />
                    <span>My Profile</span>
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="mobile-nav-link" onClick={closeMenu}>
                    <FiSettings size={20} />
                    <span>Settings</span>
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="mobile-nav-link" onClick={closeMenu}>
                    <FiHelpCircle size={20} />
                    <span>Help & Support</span>
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="mobile-menu-footer">
            {isLoggedIn ? (
              <>
                <div className="mobile-user-info">
                  <div className="mobile-user-avatar">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="mobile-user-name">{userName}</p>
                    <p className="mobile-user-email">{userEmail}</p>
                  </div>
                </div>
                <button className="mobile-logout-btn" onClick={handleLogout}>
                  <FiLogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="mobile-auth-buttons">
                <Link to="/login" className="mobile-login-btn" onClick={closeMenu}>
                  Sign In
                </Link>
                <Link to="/signup" className="mobile-signup-btn" onClick={closeMenu}>
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;