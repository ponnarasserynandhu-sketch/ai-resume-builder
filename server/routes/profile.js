const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Profile = require("../models/Profile");
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
    console.log("Received save request for user:", req.user.id);
    
    let profile = await Profile.findOne({ userId: req.user.id });
    
    // Prepare data from request body
    const updateData = {
      userId: req.user.id,
      name: req.body.name || "",
      email: req.body.email || "",
      phone: req.body.phone || "",
      address: req.body.address || "",
      role: req.body.role || "",
      linkedin: req.body.linkedin || "",
      github: req.body.github || "",
      twitter: req.body.twitter || "",
      about: req.body.about || "",
      skills: req.body.skills || "",
      experience: req.body.experience || "",
      projects: req.body.projects || "",
      certificates: req.body.certificates || "",
      languages: req.body.languages || "",
      tenthSchool: req.body.tenthSchool || "",
      tenthPercentage: req.body.tenthPercentage || "",
      tenthYear: req.body.tenthYear || "",
      interCollege: req.body.interCollege || "",
      interCourse: req.body.interCourse || "",
      interPercentage: req.body.interPercentage || "",
      interYear: req.body.interYear || "",
      degreeCollege: req.body.degreeCollege || "",
      degreeCourse: req.body.degreeCourse || "",
      degreePercentage: req.body.degreePercentage || "",
      degreeYear: req.body.degreeYear || "",
      profilePhoto: req.body.profilePhoto || "",
      portfolioUrl: req.body.portfolioUrl || ""
    };

    // Handle file upload
    if (req.file) {
      updateData.profilePhoto = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    let activityType = "profile_updated";
    let activityDesc = "Updated profile information";
    
    if (!profile) {
      activityType = "profile_created";
      activityDesc = "Created new profile";
      profile = new Profile(updateData);
      await profile.save();
      console.log("Created new profile:", profile._id);
    } else {
      // Update existing profile - fixed deprecation warning
      const updatedProfile = await Profile.findOneAndUpdate(
        { userId: req.user.id },
        { $set: updateData },
        { returnDocument: 'after' } // This fixes the deprecation warning
      );
      console.log("Updated existing profile:", updatedProfile._id);
    }

    // Log profile activity
    await logActivity(req, req.user.id, activityType, activityDesc);

    // Fetch the updated profile to return
    const savedProfile = await Profile.findOne({ userId: req.user.id });
    
    res.json({ 
      success: true, 
      message: "Profile saved successfully",
      profile: savedProfile
    });

  } catch (err) {
    console.log("Error saving profile:", err);
    res.status(500).json({ success: false, message: err.message || "Error saving profile" });
  }
});

// GET PROFILE
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    console.log("Fetched profile for user:", req.user.id, profile ? "Found" : "Not found");
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
    
    if (profile.hasPortfolio) {
      return res.json({ 
        success: true, 
        message: "Portfolio already exists",
        portfolioUrl: `/portfolio/share/${profile.userId}`,
        alreadyExists: true
      });
    }
    
    profile.hasPortfolio = true;
    profile.portfolioCreatedAt = new Date();
    
    if (!profile.portfolioUrl) {
      profile.portfolioUrl = `/portfolio/share/${profile.userId}`;
    }
    
    await profile.save();
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

// UPDATE PORTFOLIO
router.put("/update-portfolio", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    
    if (!profile.hasPortfolio) {
      return res.status(400).json({ success: false, message: "Portfolio not created yet. Please create portfolio first." });
    }
    
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

// GET PUBLIC PROFILE
router.get("/public/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};
    
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { userId: id };
    } else {
      try {
        const email = Buffer.from(id, 'base64').toString();
        query = { email: email };
      } catch (decodeError) {
        return res.status(404).json({ success: false, message: "Profile not found" });
      }
    }
    
    const profile = await Profile.findOne(query);
    
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    
    const publicProfile = profile.toObject();
    delete publicProfile.__v;
    
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