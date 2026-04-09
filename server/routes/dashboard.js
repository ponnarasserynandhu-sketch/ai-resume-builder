const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Resume = require("../models/Resume");
const Profile = require("../models/Profile");


router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // total resumes
    const totalResumes = await Resume.countDocuments({ userId });

    //  5 resumes 
    const recentResumes = await Resume.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // profile
    const profile = await Profile.findOne({ userId });

    res.json({
      success: true,
      data: {
        totalResumes,
        recentResumes, 
        profile
      }
    });

  } catch (err) {
    console.log("Dashboard error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;