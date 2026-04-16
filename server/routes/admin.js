const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Resume = require("../models/Resume");
const Activity = require("../models/Activity");

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
    
    // Get this week's new users
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });
    
    // Get total resumes count from Resume collection
    const totalResumes = await Resume.countDocuments();
    
    // Get total portfolios count - users who have created portfolio
    const totalPortfolios = await Profile.countDocuments({ hasPortfolio: true });
    
    console.log("📊 Dashboard Stats:");
    console.log("Total Users:", totalUsers);
    console.log("Total Resumes:", totalResumes);
    console.log("Total Portfolios (hasPortfolio=true):", totalPortfolios);
    
    // Enhance user data with additional info
    const enhancedUsers = await Promise.all(users.map(async (user) => {
      // Get user's profile
      const profile = await Profile.findOne({ userId: user._id });
      
      // Get user's resume count
      const resumeCount = await Resume.countDocuments({ userId: user._id });
      
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        role: user.role,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
        resumeCount: resumeCount,
        hasPortfolio: profile?.hasPortfolio || false,
        portfolioUrl: profile?.portfolioUrl || null,
        profilePhoto: profile?.profilePhoto || null
      };
    }));
    
    res.json({
      success: true,
      users: enhancedUsers,
      stats: {
        totalUsers,
        activeUsers,
        blockedUsers,
        totalResumes,
        totalPortfolios,
        newUsersThisWeek
      }
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// @route   GET /api/admin/activities
// @desc    Get all user activities
// @access  Private/Admin
router.get("/activities", [auth, admin], async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      activities
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

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
    
    if (action === "activate") {
      user.status = "active";
    } else if (action === "block") {
      user.status = "blocked";
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }
    
    await user.save();
    
    // Log activity
    const adminUser = await User.findById(req.user.id);
    await Activity.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      type: "status_updated",
      description: `User ${user.name} was ${action === "activate" ? "activated" : "blocked"} by ${adminUser.name}`
    });
    
    res.json({ 
      success: true, 
      message: `User ${action === "activate" ? "activated" : "blocked"} successfully` 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

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
    const activities = await Activity.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json({
      success: true,
      user: {
        ...user.toObject(),
        resumeCount: resumeCount,
        resumes: resumes,
        hasPortfolio: profile?.hasPortfolio || false,
        portfolioUrl: profile?.portfolioUrl || null,
        profile: profile,
        activities
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

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

// @route   GET /api/admin/debug/portfolios
// @desc    Debug endpoint to check portfolio data
// @access  Private/Admin
router.get("/debug/portfolios", [auth, admin], async (req, res) => {
  try {
    // Get all profiles
    const allProfiles = await Profile.find().populate('userId', 'name email');
    
    // Get profiles with hasPortfolio = true
    const portfolios = await Profile.find({ hasPortfolio: true }).populate('userId', 'name email');
    
    // Get profiles that might have portfolio data but hasPortfolio is false
    const potentialPortfolios = await Profile.find({
      $or: [
        { portfolioUrl: { $ne: null, $ne: "" } },
        { portfolioUrl: { $exists: true, $ne: "" } }
      ]
    });
    
    res.json({
      success: true,
      totalProfiles: allProfiles.length,
      portfoliosCount: portfolios.length,
      potentialPortfoliosCount: potentialPortfolios.length,
      portfolios: portfolios.map(p => ({
        userId: p.userId?._id || p.userId,
        userName: p.userId?.name || "Unknown",
        userEmail: p.userId?.email || "Unknown",
        hasPortfolio: p.hasPortfolio,
        portfolioUrl: p.portfolioUrl,
        portfolioCreatedAt: p.portfolioCreatedAt
      })),
      allProfiles: allProfiles.map(p => ({
        userId: p.userId?._id || p.userId,
        userName: p.userId?.name || "Unknown",
        hasPortfolio: p.hasPortfolio,
        portfolioUrl: p.portfolioUrl
      }))
    });
  } catch (err) {
    console.error("Debug error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// @route   POST /api/admin/debug/set-portfolio
// @desc    Manually set hasPortfolio for a user (for testing)
// @access  Private/Admin
router.post("/debug/set-portfolio", [auth, admin], async (req, res) => {
  try {
    const { email, hasPortfolio } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Find or create profile
    let profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      profile = new Profile({ userId: user._id, name: user.name, email: user.email });
    }
    
    // Update hasPortfolio
    profile.hasPortfolio = hasPortfolio;
    if (hasPortfolio && !profile.portfolioCreatedAt) {
      profile.portfolioCreatedAt = new Date();
    }
    await profile.save();
    
    res.json({
      success: true,
      message: `Updated portfolio status for ${email} to ${hasPortfolio}`,
      profile: {
        userId: profile.userId,
        name: profile.name,
        email: profile.email,
        hasPortfolio: profile.hasPortfolio,
        portfolioCreatedAt: profile.portfolioCreatedAt
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;