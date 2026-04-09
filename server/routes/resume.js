const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Resume = require("../models/Resume");

// SAVE
router.post("/save", auth, async (req, res) => {
  try {
    const { resumeData, template } = req.body;

    const newResume = new Resume({
      userId: req.user.id,
      data: resumeData,
      template
    });

    await newResume.save();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// GET ALL
router.get("/all", auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id });
    res.json({ success: true, resumes });
  } catch {
    res.status(500).json({ success: false });
  }
});

// UPDATE
router.put("/:id", auth, async (req, res) => {
  try {
    await Resume.findByIdAndUpdate(req.params.id, {
      data: req.body
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  try {
    await Resume.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});  

module.exports = router