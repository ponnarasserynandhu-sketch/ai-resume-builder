const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Profile = require("../models/Profile");
const multer = require("multer");

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

    if (profile) {
      await Profile.updateOne({ userId: req.user.id }, data);
    } else {
      profile = new Profile(data);
      await profile.save();
    }

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

// GET PROFILE
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    res.json({ success: true, profile });
  } catch {
    res.status(500).json({ success: false });
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
    
    res.json({ success: true, profile: publicProfile });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;