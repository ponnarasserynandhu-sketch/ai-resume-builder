import Resume from "../models/Resume.js";

//  Save Resume
export const saveResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const { resumeData, template } = req.body;

    let existing = await Resume.findOne({ userId });

    if (existing) {
      // UPDATE
      existing = await Resume.findOneAndUpdate(
        { userId },
        { ...resumeData, selectedTemplate: template },
        { new: true }
      );
    } else {
      // CREATE
      existing = await Resume.create({
        userId,
        ...resumeData,
        selectedTemplate: template
      });
    }

    res.json({ success: true, resume: existing });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//  Get Resume (View Page)
export const getMyResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });

    res.json({ success: true, resume });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};


//  Resume (Edit Page)
export const updateResume = async (req, res) => {
  try {
    const updated = await Resume.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true }
    );

    res.json({ success: true, resume: updated });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};