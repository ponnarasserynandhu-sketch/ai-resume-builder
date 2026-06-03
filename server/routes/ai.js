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
  console.log("📝 SUMMARY ROUTE HIT");
  console.log("Request body:", req.body);
  
  try {
    const { role, skills } = req.body;
    
    if (!role) {
      console.log("❌ No role provided");
      return res.status(400).json({ success: false, message: "Role is required" });
    }

    if (!groq) {
      console.log("❌ Groq not configured");
      return res.status(500).json({ success: false, message: "GROQ_API_KEY not configured" });
    }

    console.log("🔄 Calling Groq API for summary...");
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `Write a professional resume summary for a ${role}${skills ? ` with skills in ${skills}` : ''}. Write 3-4 sentences. No bullet points. Be concise and impactful.`
      }],
      temperature: 0.7,
      max_tokens: 300
    });

    const summary = cleanText(response.choices[0].message.content);
    console.log("✅ Summary generated successfully");
    res.json({ success: true, summary });

  } catch (error) {
    console.error("❌ Summary error:", error.message);
    res.status(500).json({ success: false, message: "Failed to generate summary: " + error.message });
  }
});

// Generate Skills
router.post("/skills", async (req, res) => {
  console.log("🔧 SKILLS ROUTE HIT");
  console.log("Request body:", req.body);
  
  try {
    const { role } = req.body;
    
    if (!role) {
      console.log("❌ No role provided");
      return res.status(400).json({ success: false, message: "Role is required" });
    }

    if (!groq) {
      console.log("❌ Groq not configured");
      return res.status(500).json({ success: false, message: "GROQ_API_KEY not configured" });
    }

    console.log("🔄 Calling Groq API for skills...");
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
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

    console.log("✅ Skills generated successfully");
    res.json({ success: true, skills });

  } catch (error) {
    console.error("❌ Skills error:", error.message);
    res.status(500).json({ success: false, message: "Failed to generate skills: " + error.message });
  }
});

// Improve Experience - Enhanced logging
router.post("/experience", async (req, res) => {
  console.log("💼 EXPERIENCE ROUTE HIT");
  console.log("📥 Request body:", JSON.stringify(req.body, null, 2));
  
  try {
    const { experience } = req.body;
    
    console.log("📝 Experience value:", experience);
    console.log("📝 Experience type:", typeof experience);
    console.log("📝 Experience length:", experience?.length);
    
    if (!experience || experience.trim() === "") {
      console.log("❌ No experience provided");
      return res.status(400).json({ 
        success: false, 
        message: "Experience is required. Please enter your work experience first." 
      });
    }

    if (!groq) {
      console.log("❌ Groq not configured");
      return res.status(500).json({ 
        success: false, 
        message: "AI service not configured. Please check GROQ_API_KEY." 
      });
    }

    console.log("🔄 Calling Groq API for experience improvement...");
    console.log("📝 Prompt:", `Improve this resume experience description professionally. Make it more impactful with action verbs. Write 3-4 sentences only. No bullet points.\n\nOriginal: ${experience}\n\nImproved version:`);
    
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `Improve this resume experience description professionally. Make it more impactful with action verbs. Write 3-4 sentences only. No bullet points.\n\nOriginal: ${experience}\n\nImproved version:`
      }],
      temperature: 0.7,
      max_tokens: 300,
    });

    console.log("📥 Groq response:", JSON.stringify(response, null, 2));
    
    const improved = cleanText(response.choices[0]?.message?.content || experience);
    
    if (!improved || improved === experience) {
      console.log("⚠️ No improvement generated, using original");
    }
    
    console.log("✅ Improved experience:", improved);
    
    res.json({ 
      success: true, 
      improved: improved 
    });

  } catch (error) {
    console.error("❌ EXPERIENCE ERROR:", error.message);
    console.error("❌ Error details:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to improve experience: " + error.message 
    });
  }
});

// Status endpoint
router.get("/status", (req, res) => {
  res.json({
    success: true,
    groqConfigured: !!process.env.GROQ_API_KEY,
    groqApiKeyPrefix: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 10) + "..." : null,
    message: groq ? "Groq API is ready" : "Groq API is not configured",
    endpoints: {
      summary: "POST /api/ai/summary",
      skills: "POST /api/ai/skills",
      experience: "POST /api/ai/experience",
      test: "GET /api/ai/test",
      status: "GET /api/ai/status"
    }
  });
});

module.exports = router;