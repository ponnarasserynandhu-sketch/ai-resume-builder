const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Profile = require("../models/Profile");
const Resume = require("../models/Resume");
const multer = require("multer");
const logActivity = require("../middleware/activityLogger");

// IMAGE UPLOAD
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// SAVE PROFILE
router.post("/save", auth, upload.single("profilePhoto"), async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user.id });

    const data = {
      ...req.body,
      userId: req.user.id
    };

    if (req.file) {
      data.profilePhoto = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    let activityType = "profile_updated";
    let activityDesc = "Updated profile information";
    
    if (!profile) {
      activityType = "profile_created";
      activityDesc = "Created new profile";
      profile = new Profile(data);
      await profile.save();
    } else {
      await Profile.updateOne({ userId: req.user.id }, data);
    }

    // Log profile activity
    await logActivity(req, req.user.id, activityType, activityDesc);

    res.json({ success: true, message: "Profile saved successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Error saving profile" });
  }
});

// GET PROFILE
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    res.json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
});

// CREATE PORTFOLIO FROM PROFILE
router.post("/create-portfolio", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found. Please complete your profile first." });
    }
    
    // Check if portfolio already exists
    if (profile.hasPortfolio) {
      return res.json({ 
        success: true, 
        message: "Portfolio already exists",
        portfolioUrl: `/portfolio/share/${profile.userId}`,
        alreadyExists: true
      });
    }
    
    // Mark that portfolio has been created
    profile.hasPortfolio = true;
    profile.portfolioCreatedAt = new Date();
    
    // Generate portfolio URL if not exists
    if (!profile.portfolioUrl) {
      profile.portfolioUrl = `/portfolio/share/${profile.userId}`;
    }
    
    await profile.save();
    
    // Log portfolio creation activity
    await logActivity(req, req.user.id, "portfolio_created", "Generated portfolio page from profile");
    
    res.json({ 
      success: true, 
      message: "Portfolio created successfully!",
      portfolioUrl: `/portfolio/share/${profile.userId}`,
      hasPortfolio: true
    });
  } catch (err) {
    console.error("Error creating portfolio:", err);
    res.status(500).json({ success: false, message: "Server error while creating portfolio" });
  }
});

// GET PORTFOLIO STATUS
router.get("/portfolio-status", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.json({ success: true, hasPortfolio: false, profileExists: false });
    }
    
    res.json({ 
      success: true, 
      hasPortfolio: profile.hasPortfolio || false,
      portfolioUrl: profile.hasPortfolio ? `/portfolio/share/${profile.userId}` : null,
      portfolioCreatedAt: profile.portfolioCreatedAt || null,
      profileExists: true
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error checking portfolio status" });
  }
});

// UPDATE PORTFOLIO (for existing portfolio)
router.put("/update-portfolio", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    
    if (!profile.hasPortfolio) {
      return res.status(400).json({ success: false, message: "Portfolio not created yet. Please create portfolio first." });
    }
    
    // Update profile data (which will reflect in portfolio)
    const { name, role, about, skills, experience, projects, certificates, languages } = req.body;
    
    if (name) profile.name = name;
    if (role) profile.role = role;
    if (about) profile.about = about;
    if (skills) profile.skills = skills;
    if (experience) profile.experience = experience;
    if (projects) profile.projects = projects;
    if (certificates) profile.certificates = certificates;
    if (languages) profile.languages = languages;
    
    await profile.save();
    
    // Log portfolio update activity
    await logActivity(req, req.user.id, "portfolio_updated", "Updated portfolio information");
    
    res.json({ 
      success: true, 
      message: "Portfolio updated successfully!",
      portfolioUrl: `/portfolio/share/${profile.userId}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating portfolio" });
  }
});

// @route   GET /api/profile/public/:id
// @desc    Get public profile by ID or encoded email (no authentication required)
// @access  Public
router.get("/public/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};
    
    // Check if id is a valid MongoDB ObjectId (24 characters hex)
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // If it's a valid ObjectId, search by userId
      query = { userId: id };
    } else {
      // Otherwise, try to decode as base64 email
      try {
        // Decode email from base64
        const email = Buffer.from(id, 'base64').toString();
        query = { email: email };
      } catch (decodeError) {
        console.error("Base64 decode error:", decodeError);
        return res.status(404).json({ success: false, message: "Profile not found" });
      }
    }
    
    const profile = await Profile.findOne(query);
    
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    
    // Remove sensitive data if any
    const publicProfile = profile.toObject();
    delete publicProfile.__v;
    
    // Increment view count (optional feature)
    // You could add a views field to track portfolio views
    
    res.json({ success: true, profile: publicProfile });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE PORTFOLIO
router.delete("/delete-portfolio", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    
    profile.hasPortfolio = false;
    profile.portfolioCreatedAt = null;
    await profile.save();
    
    // Log portfolio deletion activity
    await logActivity(req, req.user.id, "portfolio_deleted", "Deleted portfolio page");
    
    res.json({ 
      success: true, 
      message: "Portfolio deleted successfully" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting portfolio" });
  }
});

module.exports = router;