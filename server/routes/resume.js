const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Resume = require("../models/Resume");
const logActivity = require("../middleware/activityLogger");

// SAVE RESUME (CREATE)
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

// GET ALL RESUMES
router.get("/all", auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, resumes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET SINGLE RESUME BY ID
router.get("/:id", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
    res.json({ success: true, resume });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// UPDATE RESUME
router.put("/:id", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
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

// DELETE RESUME (with debug logging)
router.delete("/:id", auth, async (req, res) => {
  try {
    console.log(`[DELETE] Resume ID: ${req.params.id}, User ID: ${req.user.id}`);
    const deletedResume = await Resume.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    if (!deletedResume) {
      console.log(`[DELETE] Resume ${req.params.id} not found for user ${req.user.id}`);
      return res.status(404).json({ success: false, message: "Resume not found or not owned by user" });
    }
    await logActivity(req, req.user.id, "resume_deleted", `Deleted resume (ID: ${req.params.id})`);
    console.log(`[DELETE] Successfully deleted resume ${req.params.id}`);
    res.json({ success: true, message: "Resume deleted successfully" });
  } catch (err) {
    console.error("[DELETE] Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// EXPORT RESUME AS PDF (placeholder)
router.post("/export-pdf/:id", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
    await logActivity(req, req.user.id, "export_pdf", `Exported resume "${resume.data?.name || resume._id}" as PDF`);
    res.json({ success: true, message: "PDF export initiated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DUPLICATE RESUME
router.post("/duplicate/:id", auth, async (req, res) => {
  try {
    const originalResume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!originalResume) return res.status(404).json({ success: false, message: "Resume not found" });
    const duplicatedResume = new Resume({
      userId: req.user.id,
      data: originalResume.data,
      template: originalResume.template,
      name: `${originalResume.data?.name || "Resume"} (Copy)`
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