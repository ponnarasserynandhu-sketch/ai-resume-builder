const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Resume = require("../models/Resume");
const Portfolio = require("../models/Portfolio");
const Activity = require("../models/Activity");
const Settings = require("../models/Settings");

// Helper function to get time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
}

// ==================== DASHBOARD ====================
// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics and users
// @access  Private/Admin
router.get("/dashboard", [auth, admin], async (req, res) => {
  try {
    // Get all users
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    
    // Get statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const blockedUsers = await User.countDocuments({ status: "blocked" });
    const inactiveUsers = await User.countDocuments({ status: "inactive" });
    
    // Get this week's new users
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });
    
    // Get total resumes count from Resume collection
    const totalResumes = await Resume.countDocuments();
    
    // Get total portfolios count
    const totalPortfolios = await Portfolio.countDocuments();
    
    // Get total activities count
    const totalActivities = await Activity.countDocuments();
    
    console.log("📊 Dashboard Stats:");
    console.log("Total Users:", totalUsers);
    console.log("Total Resumes:", totalResumes);
    console.log("Total Portfolios:", totalPortfolios);
    
    // Enhance user data with additional info
    const enhancedUsers = await Promise.all(users.map(async (user) => {
      // Get user's profile
      const profile = await Profile.findOne({ userId: user._id });
      
      // Get user's resume count
      const resumeCount = await Resume.countDocuments({ userId: user._id });
      
      // Get user's portfolio
      const portfolio = await Portfolio.findOne({ userId: user._id });
      
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        role: user.role,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
        resumeCount: resumeCount,
        hasPortfolio: !!portfolio,
        portfolioUrl: portfolio?.portfolioUrl || null,
        profilePhoto: profile?.profilePhoto || null,
        lastLogin: user.lastLogin
      };
    }));
    
    res.json({
      success: true,
      users: enhancedUsers,
      stats: {
        totalUsers,
        activeUsers,
        blockedUsers,
        inactiveUsers,
        totalResumes,
        totalPortfolios,
        totalActivities,
        newUsersThisWeek
      }
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ==================== CHART DATA ====================
// @route   GET /api/admin/chart-data
// @desc    Get chart data for platform growth and activity distribution
// @access  Private/Admin
router.get("/chart-data", [auth, admin], async (req, res) => {
  try {
    // Get monthly user growth data for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    
    // Get monthly user data
    const monthlyUserData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Get monthly resume data
    const monthlyResumeData = await Resume.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Get monthly portfolio data
    const monthlyPortfolioData = await Portfolio.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Create maps for quick lookup
    const userMap = new Map();
    const resumeMap = new Map();
    const portfolioMap = new Map();
    
    monthlyUserData.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      userMap.set(key, item.count);
    });
    
    monthlyResumeData.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      resumeMap.set(key, item.count);
    });
    
    monthlyPortfolioData.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      portfolioMap.set(key, item.count);
    });
    
    // Generate last 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const platformGrowth = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month}`;
      
      platformGrowth.push({
        month: monthNames[month - 1],
        users: userMap.get(key) || 0,
        resumes: resumeMap.get(key) || 0,
        portfolios: portfolioMap.get(key) || 0
      });
    }
    
    // Get activity distribution
    const activityTypes = await Activity.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const activityColors = {
      login: '#10b981',
      resume_created: '#3b82f6',
      resume_updated: '#6366f1',
      portfolio_created: '#8b5cf6',
      export_pdf: '#f59e0b',
      profile_updated: '#ec4899',
      profile_created: '#14b8a6',
      data_exported: '#06b6d4',
      cache_cleared: '#f97316',
      settings_updated: '#84cc16'
    };
    
    const activityNames = {
      login: 'Logins',
      resume_created: 'Resumes Created',
      resume_updated: 'Resumes Updated',
      portfolio_created: 'Portfolios Created',
      export_pdf: 'PDF Exports',
      profile_updated: 'Profile Updates',
      profile_created: 'Profiles Created',
      data_exported: 'Data Exports',
      cache_cleared: 'Cache Cleared',
      settings_updated: 'Settings Updated'
    };
    
    const activityDistribution = activityTypes.map(item => ({
      name: activityNames[item._id] || item._id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: item.count,
      color: activityColors[item._id] || '#6b7280'
    }));
    
    // If no activities, provide default data
    if (activityDistribution.length === 0) {
      activityDistribution.push(
        { name: 'Logins', value: 0, color: '#10b981' },
        { name: 'Resumes Created', value: 0, color: '#3b82f6' },
        { name: 'Portfolios Created', value: 0, color: '#8b5cf6' }
      );
    }
    
    res.json({
      success: true,
      platformGrowth,
      activityDistribution
    });
  } catch (err) {
    console.error("Chart data error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ==================== RECENT ACTIVITIES ====================
// @route   GET /api/admin/recent-activities
// @desc    Get recent user activities for dashboard
// @access  Private/Admin
router.get("/recent-activities", [auth, admin], async (req, res) => {
  try {
    const recentActivities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(20);
    
    // Format activities for display
    const formattedActivities = recentActivities.map(activity => ({
      id: activity._id,
      user: activity.userName,
      userName: activity.userName,
      userEmail: activity.userEmail,
      action: activity.description,
      description: activity.description,
      type: activity.type,
      details: activity.details || '',
      time: getTimeAgo(activity.createdAt),
      createdAt: activity.createdAt
    }));
    
    res.json({
      success: true,
      activities: formattedActivities
    });
  } catch (err) {
    console.error("Recent activities error:", err);
    res.json({
      success: true,
      activities: []
    });
  }
});

// ==================== ALL ACTIVITIES ====================
// @route   GET /api/admin/activities
// @desc    Get all user activities
// @access  Private/Admin
router.get("/activities", [auth, admin], async (req, res) => {
  try {
    const { limit = 100, type, userId } = req.query;
    
    let query = {};
    if (type) query.type = type;
    if (userId) query.userId = userId;
    
    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      activities
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== UPDATE USER STATUS ====================
// @route   PUT /api/admin/users/:userId/status
// @desc    Update user status (activate/block)
// @access  Private/Admin
router.put("/users/:userId/status", [auth, admin], async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Don't allow blocking admin users
    if (user.role === "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Cannot modify admin users" 
      });
    }
    
    let newStatus;
    let actionText;
    
    if (action === "activate") {
      newStatus = "active";
      actionText = "activated";
    } else if (action === "block") {
      newStatus = "blocked";
      actionText = "blocked";
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }
    
    user.status = newStatus;
    await user.save();
    
    // Log activity
    const adminUser = await User.findById(req.user.id);
    await Activity.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      type: "status_updated",
      description: `User ${user.name} was ${actionText} by ${adminUser.name}`
    });
    
    res.json({ 
      success: true, 
      message: `User ${actionText} successfully` 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== GET USER DETAILS ====================
// @route   GET /api/admin/users/:userId
// @desc    Get specific user details
// @access  Private/Admin
router.get("/users/:userId", [auth, admin], async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const profile = await Profile.findOne({ userId: user._id });
    const resumeCount = await Resume.countDocuments({ userId: user._id });
    const resumes = await Resume.find({ userId: user._id });
    const portfolio = await Portfolio.findOne({ userId: user._id });
    const activities = await Activity.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      user: {
        ...user.toObject(),
        resumeCount: resumeCount,
        resumes: resumes,
        hasPortfolio: !!portfolio,
        portfolioUrl: portfolio?.portfolioUrl || null,
        portfolioData: portfolio,
        profile: profile,
        activities
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== DELETE USER ====================
// @route   DELETE /api/admin/users/:userId
// @desc    Delete a user (soft delete)
// @access  Private/Admin
router.delete("/users/:userId", [auth, admin], async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    if (user.role === "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Cannot delete admin users" 
      });
    }
    
    const adminUser = await User.findById(req.user.id);
    
    // Soft delete user
    user.status = "deleted";
    user.deletedAt = new Date();
    user.deletedBy = req.user.id;
    await user.save();
    
    // Log activity
    await Activity.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      type: "user_deleted",
      description: `User ${user.name} was deleted by ${adminUser.name}`
    });
    
    res.json({ 
      success: true, 
      message: "User deleted successfully" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== GET STATISTICS ====================
// @route   GET /api/admin/stats
// @desc    Get detailed statistics
// @access  Private/Admin
router.get("/stats", [auth, admin], async (req, res) => {
  try {
    // Get resume statistics by template
    const resumeStats = await Resume.aggregate([
      {
        $group: {
          _id: "$template",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get activity statistics
    const activityStats = await Activity.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get user growth over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);
    
    res.json({
      success: true,
      stats: {
        resumeByTemplate: resumeStats,
        activityByType: activityStats,
        userGrowth: userGrowth
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== GET SYSTEM STATS ====================
// @route   GET /api/admin/system-stats
// @desc    Get system statistics
// @access  Private/Admin
router.get("/system-stats", [auth, admin], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalResumes = await Resume.countDocuments();
    const totalPortfolios = await Portfolio.countDocuments();
    const totalActivities = await Activity.countDocuments();
    
    const activeUsers = await User.countDocuments({ status: "active" });
    const blockedUsers = await User.countDocuments({ status: "blocked" });
    
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayActivities = await Activity.countDocuments({
      createdAt: { $gte: today }
    });
    
    const todayUsers = await User.countDocuments({
      createdAt: { $gte: today }
    });
    
    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          blocked: blockedUsers
        },
        content: {
          resumes: totalResumes,
          portfolios: totalPortfolios,
          activities: totalActivities
        },
        today: {
          newUsers: todayUsers,
          activities: todayActivities
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;