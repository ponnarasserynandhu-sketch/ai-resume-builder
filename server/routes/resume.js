const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Resume = require("../models/Resume");
const User = require("../models/User");
const logActivity = require("../middleware/activityLogger");

// ==================== TEST ROUTES (for debugging) ====================
router.get("/ping", (req, res) => {
  res.json({ success: true, message: "pong" });
});

router.get("/authtest", auth, (req, res) => {
  res.json({ success: true, userId: req.user.id });
});

// ==================== SAVE RESUME (CREATE) ====================
router.post("/save", auth, async (req, res) => {
  try {
    const { resumeData, template } = req.body;

    const newResume = new Resume({
      userId: req.user.id,
      data: resumeData,
      template
    });

    await newResume.save();

    await logActivity(req, req.user.id, "resume_created", `Created new resume using ${template} template`);

    res.json({ success: true, resume: newResume });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== GET ALL RESUMES ====================
router.get("/all", auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, resumes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== GET SINGLE RESUME BY ID ====================
router.get("/:id", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }
    res.json({ success: true, resume });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== UPDATE RESUME ====================
router.put("/:id", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    await Resume.findByIdAndUpdate(req.params.id, {
      data: req.body.data || req.body,
      template: req.body.template || resume.template,
      updatedAt: new Date()
    });

    await logActivity(req, req.user.id, "resume_updated", `Updated resume (ID: ${req.params.id})`);

    res.json({ success: true, message: "Resume updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== DELETE RESUME (with debug logs) ====================
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 DELETE called for ID: ${id}, user: ${req.user.id}`);

    const resume = await Resume.findOne({ _id: id, userId: req.user.id });
    if (!resume) {
      console.log(`❌ Resume ${id} not found for user ${req.user.id}`);
      return res.status(404).json({ success: false, message: "Resume not found or unauthorized" });
    }

    await Resume.findByIdAndDelete(id);
    console.log(`✅ Resume ${id} deleted successfully`);

    await logActivity(req, req.user.id, "resume_deleted", `Deleted resume (ID: ${id})`);

    res.json({ success: true, message: "Resume deleted successfully" });
  } catch (err) {
    console.error("Delete resume error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== EXPORT RESUME AS PDF ====================
router.post("/export-pdf/:id", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    await logActivity(req, req.user.id, "export_pdf", `Exported resume "${resume.name || resume._id}" as PDF`);

    res.json({ success: true, message: "PDF export initiated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== DUPLICATE RESUME ====================
router.post("/duplicate/:id", auth, async (req, res) => {
  try {
    const originalResume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!originalResume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    const duplicatedResume = new Resume({
      userId: req.user.id,
      data: originalResume.data,
      template: originalResume.template,
      name: `${originalResume.name || "Resume"} (Copy)`
    });

    await duplicatedResume.save();

    await logActivity(req, req.user.id, "resume_created", `Duplicated resume from ID: ${req.params.id}`);

    res.json({ success: true, resume: duplicatedResume });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;