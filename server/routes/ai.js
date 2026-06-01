// routes/ai.js
const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

// Initialize Groq
let groq;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  console.log("✅ Groq SDK initialized");
} else {
  console.warn("⚠️ GROQ_API_KEY not set");
}

// Clean text function
const cleanText = (text) => {
  if (!text) return "";
  return text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/\n+/g, " ").trim();
};

// Test endpoint
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "AI routes are working",
    groqConfigured: !!process.env.GROQ_API_KEY,
    availableModels: ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it"]
  });
});

// Generate Summary
router.post("/summary", async (req, res) => {
  try {
    const { role, skills } = req.body;
    
    if (!role) {
      return res.status(400).json({ success: false, message: "Role is required" });
    }

    if (!groq) {
      return res.status(500).json({ success: false, message: "GROQ_API_KEY not configured" });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // Updated to working model
      messages: [{
        role: "user",
        content: `Write a professional resume summary for a ${role}${skills ? ` with skills in ${skills}` : ''}. Write 3-4 sentences. No bullet points. Be concise and impactful.`
      }],
      temperature: 0.7,
      max_tokens: 300
    });

    const summary = cleanText(response.choices[0].message.content);
    res.json({ success: true, summary });

  } catch (error) {
    console.error("Summary error:", error.message);
    res.status(500).json({ success: false, message: "Failed to generate summary: " + error.message });
  }
});

// Generate Skills
router.post("/skills", async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ success: false, message: "Role is required" });
    }

    if (!groq) {
      return res.status(500).json({ success: false, message: "GROQ_API_KEY not configured" });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // Updated to working model
      messages: [{
        role: "user",
        content: `Suggest 8-10 professional skills for a ${role}. Return as comma-separated list only. No numbers, no bullet points, no explanations. Example format: "Skill1, Skill2, Skill3"`
      }],
      temperature: 0.7,
      max_tokens: 200
    });

    let skills = cleanText(response.choices[0].message.content);
    if (!skills.includes(',')) {
      skills = skills.replace(/\n/g, ', ');
    }

    res.json({ success: true, skills });

  } catch (error) {
    console.error("Skills error:", error.message);
    res.status(500).json({ success: false, message: "Failed to generate skills: " + error.message });
  }
});

// Improve Experience
router.post("/experience", async (req, res) => {
  try {
    const { experience } = req.body;
    
    if (!experience || experience.trim() === "") {
      return res.status(400).json({ success: false, message: "Experience is required" });
    }

    if (!groq) {
      return res.status(500).json({ success: false, message: "GROQ_API_KEY not configured" });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // Updated to working model
      messages: [{
        role: "user",
        content: `Improve this resume experience description professionally. Make it more impactful with action verbs. Write 3-4 sentences only. No bullet points.\n\nOriginal: ${experience}\n\nImproved version:`
      }],
      temperature: 0.7,
      max_tokens: 300
    });

    const improved = cleanText(response.choices[0].message.content);
    res.json({ success: true, improved });

  } catch (error) {
    console.error("Experience error:", error.message);
    res.status(500).json({ success: false, message: "Failed to improve experience: " + error.message });
  }
});

module.exports = router;