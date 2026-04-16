import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiActivity,
  FiFileText,
  FiAward,
  FiShield,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiDownload,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiTrendingUp,
  FiServer,
  FiMail,
  FiCalendar,
  FiBarChart2
} from "react-icons/fi";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    totalResumes: 0,
    totalPortfolios: 0,
    newUsersThisWeek: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [version] = useState({
    current: "2.0.0",
    releaseDate: "January 15, 2024",
    features: [
      "AI-Powered Resume Builder",
      "Multiple Resume Templates",
      "Portfolio Generator",
      "PDF Export",
      "Admin Dashboard",
      "User Activity Tracking",
      "Analytics & Insights"
    ]
  });

  useEffect(() => {
    fetchAdminData();
    fetchUserActivities();
  }, []);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/admin/dashboard",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setUsers(response.data.users);
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/admin/activities",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setActivities(response.data.activities);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  };

  const handleUserStatus = async (userId, action) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/status`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        fetchAdminData();
        fetchUserActivities();
      }
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getActivityIcon = (type) => {
    switch(type) {
      case 'login': return <FiUserCheck />;
      case 'resume_created': return <FiFileText />;
      case 'resume_updated': return <FiFileText />;
      case 'portfolio_created': return <FiAward />;
      case 'export_pdf': return <FiDownload />;
      default: return <FiActivity />;
    }
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'login': return '#10b981';
      case 'resume_created': return '#3b82f6';
      case 'resume_updated': return '#6366f1';
      case 'portfolio_created': return '#8b5cf6';
      case 'export_pdf': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title">
            <div className="admin-icon-wrapper">
              <FiShield className="admin-icon" />
            </div>
            <div>
              <h1>Admin Dashboard</h1>
              <p>Manage users, monitor activities, and track platform performance</p>
            </div>
          </div>
          <div className="header-actions">
            <div className="version-badge">
              <FiServer />
              <span>v{version.current}</span>
            </div>
            <button className="refresh-btn" onClick={fetchAdminData}>
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total-users">
            <FiUsers />
          </div>
          <div className="stat-info">
            <h3>{stats.totalUsers.toLocaleString()}</h3>
            <p>Total Users</p>
          </div>
          <div className="stat-trend positive">
            <FiTrendingUp />
            <span>+{stats.newUsersThisWeek} this week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active-users">
            <FiUserCheck />
          </div>
          <div className="stat-info">
            <h3>{stats.activeUsers.toLocaleString()}</h3>
            <p>Active Users</p>
          </div>
          <div className="stat-percent">
            {((stats.activeUsers / stats.totalUsers) * 100).toFixed(0)}% of total
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blocked-users">
            <FiUserX />
          </div>
          <div className="stat-info">
            <h3>{stats.blockedUsers.toLocaleString()}</h3>
            <p>Blocked Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon resumes">
            <FiFileText />
          </div>
          <div className="stat-info">
            <h3>{stats.totalResumes.toLocaleString()}</h3>
            <p>Total Resumes</p>
          </div>
          <div className="stat-label">Created by users</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon portfolios">
            <FiAward />
          </div>
          <div className="stat-info">
            <h3>{stats.totalPortfolios.toLocaleString()}</h3>
            <p>Portfolios</p>
          </div>
          <div className="stat-label">Generated</div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="quick-stats-row">
        <div className="quick-stat-card">
          <div className="quick-stat-icon">
            <FiBarChart2 />
          </div>
          <div className="quick-stat-info">
            <span className="quick-stat-label">Avg. Resumes per User</span>
            <span className="quick-stat-value">{(stats.totalResumes / stats.totalUsers || 0).toFixed(1)}</span>
          </div>
        </div>
        <div className="quick-stat-card">
          <div className="quick-stat-icon">
            <FiAward />
          </div>
          <div className="quick-stat-info">
            <span className="quick-stat-label">Portfolio Conversion</span>
            <span className="quick-stat-value">{((stats.totalPortfolios / stats.totalUsers) * 100 || 0).toFixed(1)}%</span>
          </div>
        </div>
        <div className="quick-stat-card">
          <div className="quick-stat-icon">
            <FiUserCheck />
          </div>
          <div className="quick-stat-info">
            <span className="quick-stat-label">Active Rate</span>
            <span className="quick-stat-value">{((stats.activeUsers / stats.totalUsers) * 100 || 0).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Users Management Section */}
      <div className="admin-section">
        <div className="section-header">
          <div className="section-title">
            <FiUsers />
            <h2>User Management</h2>
            <span className="user-count">{filteredUsers.length} users</span>
          </div>
          <div className="section-controls">
            <div className="search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-box">
              <FiFilter />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Users</option>
                <option value="active">Active Only</option>
                <option value="blocked">Blocked Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="users-grid">
          {filteredUsers.map((user) => (
            <div key={user._id} className="user-card">
              <div className="user-card-header">
                <div className="user-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="user-status-badge">
                  <span className={`status-dot ${user.status}`}></span>
                  <span className="status-text">{user.status}</span>
                </div>
              </div>
              <div className="user-card-body">
                <h4>{user.name}</h4>
                <p className="user-email">
                  <FiMail size={14} /> {user.email}
                </p>
                <div className="user-stats">
                  <div className="user-stat">
                    <FiFileText size={14} />
                    <span>{user.resumeCount || 0} Resumes</span>
                  </div>
                  <div className="user-stat">
                    <FiAward size={14} />
                    <span>{user.hasPortfolio ? 'Has Portfolio' : 'No Portfolio'}</span>
                  </div>
                </div>
                <div className="user-meta">
                  <span><FiCalendar size={12} /> Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                  <span><FiClock size={12} /> Last: {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>
              <div className="user-card-actions">
                <button
                  className="action-icon view"
                  onClick={() => {
                    setSelectedUser(user);
                    setShowUserModal(true);
                  }}
                  title="View Details"
                >
                  <FiEye />
                  View
                </button>
                {user.status === 'active' ? (
                  <button
                    className="action-icon block"
                    onClick={() => handleUserStatus(user._id, 'block')}
                    title="Block User"
                  >
                    <FiUserX />
                    Block
                  </button>
                ) : (
                  <button
                    className="action-icon activate"
                    onClick={() => handleUserStatus(user._id, 'activate')}
                    title="Activate User"
                  >
                    <FiUserCheck />
                    Activate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="admin-section">
        <div className="section-header">
          <div className="section-title">
            <FiActivity />
            <h2>Recent Activities</h2>
          </div>
          <button className="refresh-btn small" onClick={fetchUserActivities}>
            <FiRefreshCw /> Refresh
          </button>
        </div>

        <div className="activities-timeline">
          {activities.slice(0, 10).map((activity, index) => (
            <div 
              key={index} 
              className="activity-timeline-item"
              onClick={() => {
                setSelectedActivity(activity);
                setShowActivityModal(true);
              }}
            >
              <div className="timeline-line"></div>
              <div className="timeline-dot" style={{ background: getActivityColor(activity.type) }}></div>
              <div className="activity-content">
                <div className="activity-icon" style={{ background: getActivityColor(activity.type) }}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activity-info">
                  <p className="activity-text">{activity.description}</p>
                  <div className="activity-footer">
                    <span className="activity-user">
                      <FiUserCheck size={12} /> {activity.userName}
                    </span>
                    <span className="activity-time">
                      <FiClock size={12} /> {new Date(activity.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Info Section */}
      <div className="admin-section">
        <div className="section-header">
          <div className="section-title">
            <FiServer />
            <h2>System Information</h2>
          </div>
        </div>
        
        <div className="system-info-grid">
          <div className="info-card">
            <h3>Version Details</h3>
            <div className="version-display">
              <span className="version-label">Current Version</span>
              <span className="version-number">{version.current}</span>
            </div>
            <p className="release-date">Released on {version.releaseDate}</p>
          </div>
          
          <div className="info-card">
            <h3>Features Included</h3>
            <div className="features-grid">
              {version.features.map((feature, index) => (
                <div key={index} className="feature-tag">
                  <FiCheckCircle className="feature-check" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-avatar">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{selectedUser.name}</h3>
                  <p>{selectedUser.email}</p>
                </div>
              </div>
              <button className="close-modal" onClick={() => setShowUserModal(false)}>
                <FiXCircle />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Account Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span className={`status-badge ${selectedUser.status}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Role:</strong>
                    <span>{selectedUser.role || 'User'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Joined:</strong>
                    <span>{new Date(selectedUser.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Last Active:</strong>
                    <span>{selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleString() : 'Never'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Activity Summary</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Total Resumes:</strong>
                    <span>{selectedUser.resumeCount || 0}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Portfolio:</strong>
                    <span>{selectedUser.hasPortfolio ? 'Created ✓' : 'Not Created'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedUser.status === 'active' ? (
                <button
                  className="btn-block"
                  onClick={() => {
                    handleUserStatus(selectedUser._id, 'block');
                    setShowUserModal(false);
                  }}
                >
                  <FiUserX /> Block User
                </button>
              ) : (
                <button
                  className="btn-activate"
                  onClick={() => {
                    handleUserStatus(selectedUser._id, 'activate');
                    setShowUserModal(false);
                  }}
                >
                  <FiUserCheck /> Activate User
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activity Details Modal */}
      {showActivityModal && selectedActivity && (
        <div className="modal-overlay" onClick={() => setShowActivityModal(false)}>
          <div className="activity-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Activity Details</h3>
              <button className="close-modal" onClick={() => setShowActivityModal(false)}>
                <FiXCircle />
              </button>
            </div>
            <div className="modal-body">
              <div className="activity-detail-icon" style={{ background: getActivityColor(selectedActivity.type) }}>
                {getActivityIcon(selectedActivity.type)}
              </div>
              <div className="activity-detail-info">
                <p className="detail-description">{selectedActivity.description}</p>
                <div className="detail-meta">
                  <div><strong>User:</strong> {selectedActivity.userName}</div>
                  <div><strong>Email:</strong> {selectedActivity.userEmail}</div>
                  <div><strong>Time:</strong> {new Date(selectedActivity.createdAt).toLocaleString()}</div>
                  <div><strong>Type:</strong> {selectedActivity.type}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;