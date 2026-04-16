const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Resume = require("../models/Resume");
const User = require("../models/User");
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

    // Log resume creation activity
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
    
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }
    
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
    
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }
    
    await Resume.findByIdAndUpdate(req.params.id, {
      data: req.body.data || req.body,
      template: req.body.template || resume.template,
      updatedAt: new Date()
    });
    
    // Log resume update activity
    await logActivity(req, req.user.id, "resume_updated", `Updated resume (ID: ${req.params.id})`);
    
    res.json({ success: true, message: "Resume updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE RESUME
router.delete("/:id", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }
    
    await Resume.findByIdAndDelete(req.params.id);
    
    // Log resume deletion activity
    await logActivity(req, req.user.id, "resume_deleted", `Deleted resume (ID: ${req.params.id})`);
    
    res.json({ success: true, message: "Resume deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// EXPORT RESUME AS PDF
router.post("/export-pdf/:id", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }
    
    // Log PDF export activity
    await logActivity(req, req.user.id, "export_pdf", `Exported resume "${resume.name || resume._id}" as PDF`);
    
    // Note: Actual PDF generation should be handled here
    // You can use libraries like puppeteer, pdfkit, or html-pdf
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
    
    // Log duplication activity
    await logActivity(req, req.user.id, "resume_created", `Duplicated resume from ID: ${req.params.id}`);
    
    res.json({ success: true, resume: duplicatedResume });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;