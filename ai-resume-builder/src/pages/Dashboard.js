import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import API_URL from '../config';
import Profile from "./Profile";
import CreateResume from "./CreateResume";
import ViewResumes from "./ViewResumes";
import EditResume from "./EditResumes";
import Portfolio from "./Portfolio";
import {
  FiHome,
  FiFileText,
  FiEdit2,
  FiEye,
  FiFolder,
  FiUser,
  FiLogOut,
  FiGrid,
  FiPlusCircle,
  FiList,
  FiGlobe,
  FiChevronRight,
  FiBell
} from "react-icons/fi";

function Dashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState("home");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [resumeCount, setResumeCount] = useState(0);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [recentResumes, setRecentResumes] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchDashboardData();
  }, []);

  // Fetch user data from API with token validation
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (res.ok) {
        const data = await res.json();

        if (data.success) {
          setUserName(data.user.name || "User");
          setUserEmail(data.user.email || "");
        }
      }
    } catch (error) {
      console.error("User fetch error:", error);
    }
  };

  // Single API call to /api/dashboard with token validation
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/api/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (res.ok) {
        const data = await res.json();

        if (data.success) {
          setResumeCount(data.data.totalResumes || 0);
          setRecentResumes(data.data.recentResumes || []);
          setPortfolioCount(0);
        }
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { id: "home", label: "Dashboard", icon: FiHome, color: "#4361ee" },
    { id: "create", label: "Create Resume", icon: FiPlusCircle, color: "#06d6a0" },
    { id: "edit", label: "Edit Resume", icon: FiEdit2, color: "#f9c74f" },
    { id: "view", label: "View Resumes", icon: FiEye, color: "#f9844a" },
    { id: "portfolio", label: "Portfolio", icon: FiGlobe, color: "#9c89b8" },
    { id: "profile", label: "My Profile", icon: FiUser, color: "#4c9aff" }
  ];

  const renderContent = () => {
    switch(section) {
      case "home":
        return (
          <div className="home-container">
            {/* Welcome Banner */}
            <div className="welcome-banner">
              <div className="banner-content">
                <h1>Create Your Professional Resume with AI</h1>
                <p>Get started with our AI-powered resume builder and land your dream job faster.</p>
                <button 
                  className="create-resume-btn"
                  onClick={() => setSection("create")}
                >
                  Create New Resume
                  <FiPlusCircle size={18} />
                </button>
              </div>
              <div className="banner-decoration"></div>
            </div>

            {/* Quick Actions & Recent Resumes */}
            <div className="two-column-layout">
              <div className="quick-actions">
                <h3 className="section-title">Quick Actions</h3>
                <div className="actions-grid">
                  <div 
                    className="action-card"
                    onClick={() => setSection("create")}
                  >
                    <div className="action-icon" style={{ backgroundColor: "#4361ee15" }}>
                      <FiPlusCircle size={24} color="#4361ee" />
                    </div>
                    <h4>Create New Resume</h4>
                    <p>Start from scratch or use template</p>
                  </div>
                  <div 
                    className="action-card"
                    onClick={() => setSection("portfolio")}
                  >
                    <div className="action-icon" style={{ backgroundColor: "#06d6a015" }}>
                      <FiGlobe size={24} color="#06d6a0" />
                    </div>
                    <h4>Generate Portfolio</h4>
                    <p>Create your portfolio website</p>
                  </div>
                  <div 
                    className="action-card"
                    onClick={() => setSection("view")}
                  >
                    <div className="action-icon" style={{ backgroundColor: "#f9c74f15" }}>
                      <FiEye size={24} color="#f9c74f" />
                    </div>
                    <h4>View All Resumes</h4>
                    <p>Manage your existing resumes</p>
                  </div>
                </div>
              </div>

              <div className="recent-resumes">
                <h3 className="section-title">Recently Created Resumes</h3>
                <div className="resumes-list">
                  {recentResumes.length > 0 ? (
                    recentResumes.map((resume) => (
                      <div 
                        key={resume._id} 
                        className="resume-item"
                        onClick={() => setSection("view")}
                      >
                        <div className="resume-info">
                          <FiFileText size={20} color="#4361ee" />
                          <div>
                            <h4>{resume.data?.name || "Untitled Resume"}</h4>
                            <p>Created {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : "Recently"}</p>
                          </div>
                        </div>
                        <span className="resume-badge">
                          {resume.data?.role || "Resume"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-resumes">
                      <p>No resumes created yet.</p>
                      <button 
                        className="create-resume-small-btn"
                        onClick={() => setSection("create")}
                      >
                        Create your first resume
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case "create":
        return <CreateResume onResumeCreated={fetchDashboardData} />;
      case "edit":
        return <EditResume />;
      case "view":
        return <ViewResumes />;
      case "portfolio":
        return <Portfolio />;
      case "profile":
        return <Profile />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn" 
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        <FiGrid size={24} />
      </button>

      {/* SIDEBAR */}
      <div className={`sidebar ${showMobileMenu ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <svg className="logo-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="10" fill="url(#dashboardLogoGradient)"/>
                <defs>
                  <linearGradient id="dashboardLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1"/>
                    <stop offset="100%" stopColor="#8b5cf6"/>
                  </linearGradient>
                </defs>
                <path d="M12 15L20 10L28 15V25L20 30L12 25V15Z" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M20 20V30M12 15L20 20L28 15" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <circle cx="20" cy="20" r="2" fill="white"/>
              </svg>
            </div>
            <div className="logo-text-container">
              <h2 className="logo-text">AI Resume</h2>
              <span className="logo-tagline">Builder</span>
            </div>
          </div>
          <button 
            className="close-mobile-menu"
            onClick={() => setShowMobileMenu(false)}
          >
            ×
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.id}
                onClick={() => {
                  setSection(item.id);
                  setShowMobileMenu(false);
                }}
                className={section === item.id ? "active" : ""}
              >
                <div className="nav-icon" style={{ backgroundColor: `${item.color}15` }}>
                  <Icon size={20} color={item.color} />
                </div>
                <span>{item.label}</span>
                {section === item.id && <FiChevronRight className="active-indicator" />}
              </li>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* OVERLAY for mobile */}
      {showMobileMenu && (
        <div className="mobile-overlay" onClick={() => setShowMobileMenu(false)} />
      )}

      {/* MAIN AREA */}
      <div className="main">
        {/* TOP NAVBAR */}
        <div className="topbar">
          <div className="topbar-left">
            <h3 className="page-title">
              {menuItems.find(item => item.id === section)?.label || "Dashboard"}
            </h3>
            <p className="page-subtitle">
              Welcome back, {userName || "User"}! Ready to create something amazing?
            </p>
          </div>

          <div className="topbar-right">
            <div className="notification-icon">
              <FiBell size={20} />
              <span className="notification-badge">3</span>
            </div>
            
            <div className="user-menu">
              <div className="user-avatar">
                {userName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="user-info">
                <p className="user-name">{userName || "User"}</p>
                <p className="user-email">{userEmail || "user@example.com"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* BODY CONTENT */}
        <div className="content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;