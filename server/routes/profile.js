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

module.exports = router;