import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from '../config';
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
  FiMail,
  FiCalendar,
  FiHome,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiStar,
  FiBell,
  FiCpu,
  FiBarChart2,
  FiGlobe,
  FiServer,
  FiDatabase,
  FiCloud,
  FiLock,
  FiUsers as FiUsersIcon,
  FiPieChart,
  FiBox,
  FiZap,
  FiLayers,
  FiShield as FiShieldIcon,
  FiTool,
  FiTrash2,
  FiRefreshCcw
} from "react-icons/fi";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import "./AdminDashboard.css";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
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
  
  const [platformGrowthData, setPlatformGrowthData] = useState([]);
  const [activityDistributionData, setActivityDistributionData] = useState([]);
  const [recentActivitiesList, setRecentActivitiesList] = useState([]);
  
  const [version] = useState("2.0.0");

  useEffect(() => {
    fetchAdminData();
    fetchChartData();
    fetchRecentActivities();
  }, []);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/admin/dashboard`,
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

  const fetchChartData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/admin/chart-data`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setPlatformGrowthData(response.data.platformGrowth);
        setActivityDistributionData(response.data.activityDistribution);
      } else {
        setPlatformGrowthData([
          { month: 'Jan', users: 45, resumes: 32, portfolios: 12 },
          { month: 'Feb', users: 62, resumes: 48, portfolios: 18 },
          { month: 'Mar', users: 78, resumes: 64, portfolios: 25 },
          { month: 'Apr', users: 94, resumes: 82, portfolios: 34 },
          { month: 'May', users: 112, resumes: 98, portfolios: 42 },
          { month: 'Jun', users: 135, resumes: 124, portfolios: 56 }
        ]);
        setActivityDistributionData([
          { name: 'Logins', value: 45, color: '#10b981' },
          { name: 'Resumes', value: 28, color: '#3b82f6' },
          { name: 'Portfolios', value: 15, color: '#8b5cf6' },
          { name: 'Exports', value: 12, color: '#f59e0b' }
        ]);
      }
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setPlatformGrowthData([
        { month: 'Jan', users: 45, resumes: 32, portfolios: 12 },
        { month: 'Feb', users: 62, resumes: 48, portfolios: 18 },
        { month: 'Mar', users: 78, resumes: 64, portfolios: 25 },
        { month: 'Apr', users: 94, resumes: 82, portfolios: 34 },
        { month: 'May', users: 112, resumes: 98, portfolios: 42 },
        { month: 'Jun', users: 135, resumes: 124, portfolios: 56 }
      ]);
      setActivityDistributionData([
        { name: 'Logins', value: 45, color: '#10b981' },
        { name: 'Resumes', value: 28, color: '#3b82f6' },
        { name: 'Portfolios', value: 15, color: '#8b5cf6' },
        { name: 'Exports', value: 12, color: '#f59e0b' }
      ]);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/admin/recent-activities`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setRecentActivitiesList(response.data.activities);
        setActivities(response.data.activities);
      } else {
        const defaultActivities = [
          { user: 'John Doe', action: 'Created new resume', time: '2 minutes ago', type: 'resume', details: 'Software Engineer Resume', userName: 'John Doe', userEmail: 'john@example.com', createdAt: new Date() },
          { user: 'Jane Smith', action: 'Generated portfolio', time: '15 minutes ago', type: 'portfolio', details: 'Professional Portfolio', userName: 'Jane Smith', userEmail: 'jane@example.com', createdAt: new Date() },
          { user: 'Mike Johnson', action: 'Logged in', time: '1 hour ago', type: 'login', details: '', userName: 'Mike Johnson', userEmail: 'mike@example.com', createdAt: new Date() }
        ];
        setRecentActivitiesList(defaultActivities);
        setActivities(defaultActivities);
      }
    } catch (err) {
      console.error("Error fetching recent activities:", err);
      const defaultActivities = [
        { user: 'John Doe', action: 'Created new resume', time: '2 minutes ago', type: 'resume', details: 'Software Engineer Resume', userName: 'John Doe', userEmail: 'john@example.com', createdAt: new Date() },
        { user: 'Jane Smith', action: 'Generated portfolio', time: '15 minutes ago', type: 'portfolio', details: 'Professional Portfolio', userName: 'Jane Smith', userEmail: 'jane@example.com', createdAt: new Date() },
        { user: 'Mike Johnson', action: 'Logged in', time: '1 hour ago', type: 'login', details: '', userName: 'Mike Johnson', userEmail: 'mike@example.com', createdAt: new Date() }
      ];
      setRecentActivitiesList(defaultActivities);
      setActivities(defaultActivities);
    }
  };

  const handleUserStatus = async (userId, action) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/api/admin/users/${userId}/status`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        fetchAdminData();
        fetchRecentActivities();
      }
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/settings/export-data`,
        { type: "all" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        const dataStr = JSON.stringify(response.data.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `export_data_${new Date().toISOString()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        const successMsg = document.createElement('div');
        successMsg.className = 'status-badge success';
        successMsg.innerHTML = '✅ Data exported successfully!';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
      }
    } catch (err) {
      console.error("Export error:", err);
      const errorMsg = document.createElement('div');
      errorMsg.className = 'status-badge error';
      errorMsg.innerHTML = '❌ Export failed';
      document.body.appendChild(errorMsg);
      setTimeout(() => errorMsg.remove(), 3000);
    }
  };

  const handleClearCache = async () => {
    if (!window.confirm("Are you sure you want to clear the system cache?")) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/settings/clear-cache`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        const successMsg = document.createElement('div');
        successMsg.className = 'status-badge success';
        successMsg.innerHTML = '🗑️ Cache cleared successfully!';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
      }
    } catch (err) {
      console.error("Clear cache error:", err);
      const errorMsg = document.createElement('div');
      errorMsg.className = 'status-badge error';
      errorMsg.innerHTML = '❌ Failed to clear cache';
      document.body.appendChild(errorMsg);
      setTimeout(() => errorMsg.remove(), 3000);
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
    <div className="admin-app">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <FiShield />
            </div>
            {sidebarOpen && (
              <div className="logo-text">
                <span className="logo-name">Admin</span>
                <span className="logo-sub">Dashboard</span>
              </div>
            )}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FiHome />
            {sidebarOpen && <span>Dashboard</span>}
          </button>
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FiUsers />
            {sidebarOpen && <span>Users</span>}
          </button>
          <button 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <FiBarChart2 />
            {sidebarOpen && <span>Analytics</span>}
          </button>
          <button 
            className={`nav-item ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            <FiActivity />
            {sidebarOpen && <span>Activities</span>}
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FiSettings />
            {sidebarOpen && <span>Settings</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={handleLogout}>
            <FiLogOut />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Top Bar */}
        <div className="top-bar">
          <div className="top-bar-left">
            <h2>
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'analytics' && 'Analytics & Insights'}
              {activeTab === 'activities' && 'Recent Activities'}
              {activeTab === 'settings' && 'System Settings'}
            </h2>
          </div>
          <div className="top-bar-right">
            <div className="notification-icon">
              <FiBell />
              <span className="notification-badge">3</span>
            </div>
            <div className="admin-profile">
              <div className="admin-avatar">A</div>
              <div className="admin-info">
                <span className="admin-name">Admin User</span>
                <span className="admin-role">Super Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon total-users">
                  <FiUsers />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalUsers.toLocaleString()}</h3>
                  <p>Total Users</p>
                </div>
                <div className="stat-change positive">
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
                <div className="stat-icon resumes">
                  <FiFileText />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalResumes.toLocaleString()}</h3>
                  <p>Total Resumes</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon portfolios">
                  <FiAward />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalPortfolios.toLocaleString()}</h3>
                  <p>Portfolios Created</p>
                </div>
              </div>
            </div>

            <div className="charts-row">
              <div className="chart-card">
                <div className="chart-header">
                  <h3>📈 Platform Growth</h3>
                  <div className="chart-legends">
                    <span><span className="legend-dot users"></span> Users</span>
                    <span><span className="legend-dot resumes"></span> Resumes</span>
                    <span><span className="legend-dot portfolios"></span> Portfolios</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={platformGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                    <Line type="monotone" dataKey="resumes" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
                    <Line type="monotone" dataKey="portfolios" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>🎯 Activity Distribution</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={activityDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {activityDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="activity-legend">
                  {activityDistributionData.map((item, index) => (
                    <div key={index} className="legend-item">
                      <span className="legend-color" style={{ background: item.color }}></span>
                      <span>{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="recent-section">
              <div className="section-header">
                <h3>🔄 Recent Activity</h3>
                <button className="view-all" onClick={() => setActiveTab('activities')}>
                  View All Activities →
                </button>
              </div>
              <div className="activity-feed">
                {recentActivitiesList.slice(0, 5).map((activity, index) => (
                  <div 
                    key={index} 
                    className="feed-item"
                    onClick={() => {
                      setSelectedActivity(activity);
                      setShowActivityModal(true);
                    }}
                  >
                    <div className={`feed-icon ${activity.type}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="feed-content">
                      <p className="feed-text">
                        <strong>{activity.userName || activity.user}</strong> {activity.action || activity.description}
                      </p>
                      {activity.details && <span className="feed-details">{activity.details}</span>}
                      <span className="feed-time">
                        {activity.time || new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab Content */}
        {activeTab === 'users' && (
          <div className="users-content">
            <div className="users-header">
              <div className="search-filter">
                <div className="search-box">
                  <FiSearch />
                  <input
                    type="text"
                    placeholder="Search users..."
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
                <button className="refresh-btn" onClick={fetchAdminData}>
                  <FiRefreshCw /> Refresh
                </button>
              </div>
            </div>

            <div className="users-grid">
              {filteredUsers.map((user) => (
                <div key={user._id} className="user-card">
                  <div className="user-card-header">
                    <div className="user-avatar">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className={`user-status ${user.status}`}>
                      {user.status === 'active' ? <FiCheckCircle /> : <FiXCircle />}
                      {user.status}
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
                    </div>
                  </div>
                  <div className="user-card-actions">
                    <button
                      className="action-btn view"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                    >
                      <FiEye /> View
                    </button>
                    {user.status === 'active' ? (
                      <button
                        className="action-btn block"
                        onClick={() => handleUserStatus(user._id, 'block')}
                      >
                        <FiUserX /> Block
                      </button>
                    ) : (
                      <button
                        className="action-btn activate"
                        onClick={() => handleUserStatus(user._id, 'activate')}
                      >
                        <FiUserCheck /> Activate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab Content */}
        {activeTab === 'analytics' && (
          <div className="analytics-content">
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>User Growth Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={platformGrowthData}>
                    <defs>
                      <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="url(#userGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="analytics-card">
                <h3>Feature Usage Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="resumes" fill="#10b981" name="Resumes" />
                    <Bar dataKey="portfolios" fill="#8b5cf6" name="Portfolios" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="stats-summary">
              <div className="summary-card">
                <div className="summary-icon">
                  <FiStar />
                </div>
                <div className="summary-info">
                  <h4>Conversion Rate</h4>
                  <p className="summary-value">{((stats.totalPortfolios / stats.totalUsers) * 100 || 0).toFixed(1)}%</p>
                  <span>Users who created portfolios</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">
                  <FiFileText />
                </div>
                <div className="summary-info">
                  <h4>Avg. Resumes/User</h4>
                  <p className="summary-value">{(stats.totalResumes / stats.totalUsers || 0).toFixed(1)}</p>
                  <span>Resumes per user average</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">
                  <FiTrendingUp />
                </div>
                <div className="summary-info">
                  <h4>Growth Rate</h4>
                  <p className="summary-value">{((stats.newUsersThisWeek / stats.totalUsers) * 100 || 0).toFixed(1)}%</p>
                  <span>Weekly growth rate</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activities Tab Content */}
        {activeTab === 'activities' && (
          <div className="activities-content">
            <div className="activities-timeline">
              {recentActivitiesList.map((activity, index) => (
                <div 
                  key={index} 
                  className="activity-item"
                  onClick={() => {
                    setSelectedActivity(activity);
                    setShowActivityModal(true);
                  }}
                >
                  <div className="activity-icon" style={{ background: getActivityColor(activity.type) }}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-details">
                    <p className="activity-description">
                      <strong>{activity.userName || activity.user}</strong> {activity.action || activity.description}
                    </p>
                    {activity.details && <span className="activity-detail">{activity.details}</span>}
                    <div className="activity-meta">
                      <span className="activity-time">
                        <FiClock size={12} /> {activity.time || new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab Content */}
        {activeTab === 'settings' && (
          <div className="settings-content">
            {/* Header */}
            <div className="settings-header">
              <div className="settings-header-icon">
                <FiSettings />
              </div>
              <div className="settings-header-text">
                <h2>Settings</h2>
                <p>Manage your system preferences and configurations</p>
              </div>
            </div>

            {/* Settings Grid */}
            <div className="settings-grid-simple">
              {/* General Settings Card */}
              <div className="settings-card-simple">
                <div className="settings-card-simple-header">
                  <div className="settings-card-simple-icon">
                    <FiServer />
                  </div>
                  <h3>General Settings</h3>
                </div>
                <div className="settings-card-simple-body">
                  <div className="settings-item">
                    <div className="settings-item-label">
                      <FiBox /> System Version
                    </div>
                    <div className="settings-item-value">{version}</div>
                  </div>
                  <div className="settings-item">
                    <div className="settings-item-label">
                      <FiDatabase /> Database Status
                    </div>
                    <div className="settings-item-value success">Connected</div>
                  </div>
                  <div className="settings-item">
                    <div className="settings-item-label">
                      <FiCloud /> Server Status
                    </div>
                    <div className="settings-item-value success">Operational</div>
                  </div>
                </div>
              </div>

              {/* Security Card */}
              <div className="settings-card-simple">
                <div className="settings-card-simple-header">
                  <div className="settings-card-simple-icon">
                    <FiShieldIcon />
                  </div>
                  <h3>Security</h3>
                </div>
                <div className="settings-card-simple-body">
                  <div className="settings-item">
                    <div className="settings-item-label">
                      <FiLock /> SSL Certificate
                    </div>
                    <div className="settings-item-value success">Active</div>
                  </div>
                  <div className="settings-item">
                    <div className="settings-item-label">
                      <FiShieldIcon /> Firewall
                    </div>
                    <div className="settings-item-value success">Enabled</div>
                  </div>
                  <div className="settings-item">
                    <div className="settings-item-label">
                      <FiUserCheck /> Two-Factor Auth
                    </div>
                    <div className="settings-item-value warning">Optional</div>
                  </div>
                </div>
              </div>

              {/* Admin Actions Card */}
              <div className="settings-card-simple danger">
                <div className="settings-card-simple-header">
                  <div className="settings-card-simple-icon">
                    <FiTool />
                  </div>
                  <h3>Admin Actions</h3>
                </div>
                <div className="settings-card-simple-body">
                  <button className="settings-action-btn secondary" onClick={handleExportData}>
                    <FiDownload /> Export Data
                  </button>
                  <button className="settings-action-btn secondary" onClick={handleClearCache}>
                    <FiRefreshCcw /> Clear Cache
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
                <p className="detail-description">
                  <strong>{selectedActivity.userName || selectedActivity.user}</strong> {selectedActivity.action || selectedActivity.description}
                </p>
                {selectedActivity.details && <p className="detail-details">{selectedActivity.details}</p>}
                <div className="detail-meta">
                  <div><strong>Email:</strong> {selectedActivity.userEmail}</div>
                  <div><strong>Time:</strong> {selectedActivity.time || new Date(selectedActivity.createdAt).toLocaleString()}</div>
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