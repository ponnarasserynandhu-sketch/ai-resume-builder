const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Portfolio = require("../models/Portfolio");
const Profile = require("../models/Profile");
const Resume = require("../models/Resume");
const logActivity = require("../middleware/activityLogger");

// @route   GET /api/portfolio/my-portfolio
// @desc    Get current user's portfolio
// @access  Private
router.get("/my-portfolio", auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user.id });
    
    if (!portfolio) {
      // Get profile data to create default portfolio
      const profile = await Profile.findOne({ userId: req.user.id });
      const resumes = await Resume.find({ userId: req.user.id });
      
      return res.json({
        success: true,
        portfolio: null,
        profile: profile || null,
        resumes: resumes || [],
        message: "No portfolio found. Create one?"
      });
    }
    
    res.json({
      success: true,
      portfolio
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   POST /api/portfolio/create
// @desc    Create a new portfolio
// @access  Private
router.post("/create", auth, async (req, res) => {
  try {
    // Check if portfolio already exists
    let portfolio = await Portfolio.findOne({ userId: req.user.id });
    
    if (portfolio) {
      return res.status(400).json({
        success: false,
        message: "Portfolio already exists. Use update endpoint instead."
      });
    }
    
    // Get user profile data
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Please complete your profile first"
      });
    }
    
    // Create new portfolio
    portfolio = new Portfolio({
      userId: req.user.id,
      title: `${profile.name || "My"} Portfolio`,
      isPublished: false
    });
    
    await portfolio.save();
    
    // Update profile to mark portfolio as created
    profile.hasPortfolio = true;
    profile.portfolioCreatedAt = new Date();
    profile.portfolioUrl = `/portfolio/${req.user.id}`;
    await profile.save();
    
    // Log activity
    await logActivity(req, req.user.id, "portfolio_created", "Created new portfolio");
    
    res.json({
      success: true,
      message: "Portfolio created successfully",
      portfolio
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   PUT /api/portfolio/update
// @desc    Update portfolio
// @access  Private
router.put("/update", auth, async (req, res) => {
  try {
    const {
      title,
      isPublished,
      theme,
      sections,
      socialLinks,
      colorScheme,
      seo,
      customCss
    } = req.body;
    
    let portfolio = await Portfolio.findOne({ userId: req.user.id });
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found. Create one first."
      });
    }
    
    // Update fields
    if (title) portfolio.title = title;
    if (typeof isPublished !== "undefined") {
      portfolio.isPublished = isPublished;
      if (isPublished && !portfolio.publishedAt) {
        portfolio.publishedAt = new Date();
      }
    }
    if (theme) portfolio.theme = theme;
    if (sections) portfolio.sections = { ...portfolio.sections, ...sections };
    if (socialLinks) portfolio.socialLinks = { ...portfolio.socialLinks, ...socialLinks };
    if (colorScheme) portfolio.colorScheme = { ...portfolio.colorScheme, ...colorScheme };
    if (seo) portfolio.seo = { ...portfolio.seo, ...seo };
    if (customCss !== undefined) portfolio.customCss = customCss;
    
    await portfolio.save();
    
    // Log activity
    await logActivity(req, req.user.id, "portfolio_updated", "Updated portfolio settings");
    
    res.json({
      success: true,
      message: "Portfolio updated successfully",
      portfolio
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   POST /api/portfolio/publish
// @desc    Publish/unpublish portfolio
// @access  Private
router.post("/publish", auth, async (req, res) => {
  try {
    const { isPublished } = req.body;
    
    let portfolio = await Portfolio.findOne({ userId: req.user.id });
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found"
      });
    }
    
    portfolio.isPublished = isPublished;
    if (isPublished && !portfolio.publishedAt) {
      portfolio.publishedAt = new Date();
    }
    
    await portfolio.save();
    
    // Update profile
    const profile = await Profile.findOne({ userId: req.user.id });
    if (profile) {
      profile.hasPortfolio = isPublished;
      await profile.save();
    }
    
    // Log activity
    await logActivity(
      req,
      req.user.id,
      "portfolio_updated",
      `${isPublished ? "Published" : "Unpublished"} portfolio`
    );
    
    res.json({
      success: true,
      message: `Portfolio ${isPublished ? "published" : "unpublished"} successfully`,
      isPublished: portfolio.isPublished
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/portfolio/public/:userId
// @desc    Get public portfolio by user ID
// @access  Public
router.get("/public/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find portfolio
    const portfolio = await Portfolio.findOne({ userId, isPublished: true });
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found or not published"
      });
    }
    
    // Increment view count
    portfolio.views += 1;
    portfolio.lastViewedAt = new Date();
    await portfolio.save();
    
    // Get user profile data
    const profile = await Profile.findOne({ userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile data not found"
      });
    }
    
    // Get user data
    const User = require("../models/User");
    const user = await User.findById(userId).select("-password");
    
    // Prepare public data
    const publicData = {
      portfolio: {
        title: portfolio.title,
        theme: portfolio.theme,
        sections: portfolio.sections,
        socialLinks: portfolio.socialLinks,
        colorScheme: portfolio.colorScheme
      },
      profile: {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        role: profile.role,
        about: profile.about,
        skills: profile.skills ? profile.skills.split(",") : [],
        experience: profile.experience ? profile.experience.split("\n") : [],
        education: {
          tenth: {
            school: profile.tenthSchool,
            percentage: profile.tenthPercentage,
            year: profile.tenthYear
          },
          inter: {
            college: profile.interCollege,
            course: profile.interCourse,
            percentage: profile.interPercentage,
            year: profile.interYear
          },
          degree: {
            college: profile.degreeCollege,
            course: profile.degreeCourse,
            percentage: profile.degreePercentage,
            year: profile.degreeYear
          }
        },
        projects: profile.projects ? profile.projects.split("\n") : [],
        certificates: profile.certificates ? profile.certificates.split("\n") : [],
        languages: profile.languages ? profile.languages.split(",") : [],
        profilePhoto: profile.profilePhoto,
        linkedin: profile.linkedin,
        github: profile.github,
        twitter: profile.twitter
      },
      user: {
        name: user?.name,
        email: user?.email,
        joinedAt: user?.createdAt
      },
      stats: {
        views: portfolio.views,
        publishedAt: portfolio.publishedAt
      }
    };
    
    res.json({
      success: true,
      data: publicData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/portfolio/analytics
// @desc    Get portfolio analytics
// @access  Private
router.get("/analytics", auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.id });
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found"
      });
    }
    
    // Get daily views (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // You can implement more detailed analytics here
    const analytics = {
      totalViews: portfolio.views,
      lastViewedAt: portfolio.lastViewedAt,
      publishedAt: portfolio.publishedAt,
      isPublished: portfolio.isPublished,
      shareableLink: `${req.protocol}://${req.get("host")}${portfolio.shareableLink}`
    };
    
    res.json({
      success: true,
      analytics
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   DELETE /api/portfolio/delete
// @desc    Delete portfolio
// @access  Private
router.delete("/delete", auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOneAndDelete({ userId: req.user.id });
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found"
      });
    }
    
    // Update profile
    const profile = await Profile.findOne({ userId: req.user.id });
    if (profile) {
      profile.hasPortfolio = false;
      profile.portfolioCreatedAt = null;
      profile.portfolioUrl = null;
      await profile.save();
    }
    
    // Log activity
    await logActivity(req, req.user.id, "portfolio_deleted", "Deleted portfolio");
    
    res.json({
      success: true,
      message: "Portfolio deleted successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;