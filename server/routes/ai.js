const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

//  Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

//  CLEAN TEXT FUNCTION (removes unwanted symbols)
const cleanText = (text) => {
  return text
    ?.replace(/[*#-]/g, "")   // remove bullets/symbols
    ?.replace(/\n+/g, " ")    // remove new lines
    ?.trim();
};


//  SUMMARY 
router.post("/summary", async (req, res) => {
  console.log("🔥 AI SUMMARY ROUTE HIT");
  console.log("📥 BODY:", req.body);

  try {
    const { role, skills } = req.body;

    if (!role) {
      return res.json({
        success: false,
        message: "Role is required",
      });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `Write a short professional resume summary for a ${role} with skills ${skills}. 
Give only 3-4 lines in plain text.
Do NOT use headings, bullet points, or extra sections.`,
        },
      ],
    });

    const result = cleanText(response?.choices?.[0]?.message?.content);

    res.json({
      success: true,
      summary: result,
    });

  } catch (err) {
    console.log("❌ SUMMARY ERROR:", err.message);
    res.json({
      success: false,
      message: "AI failed",
    });
  }
});


//  SKILLS 
router.post("/skills", async (req, res) => {
  console.log("🔥 AI SKILLS ROUTE HIT");
  console.log("📥 BODY:", req.body);

  try {
    const { role } = req.body;

    if (!role) {
      return res.json({
        success: false,
        message: "Role is required",
      });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `Give only 8 to 10 professional skills for ${role}. 
Return as a single comma-separated line.
Do NOT explain anything.`,
        },
      ],
    });

    const result = cleanText(response?.choices?.[0]?.message?.content);

    res.json({
      success: true,
      skills: result,
    });

  } catch (err) {
    console.log("❌ SKILLS ERROR:", err.message);
    res.json({
      success: false,
      message: "AI failed",
    });
  }
});


//  EXPERIENCE 
router.post("/experience", async (req, res) => {
  console.log("🔥 AI EXPERIENCE ROUTE HIT");
  console.log("📥 BODY:", req.body);

  try {
    const { experience } = req.body;

    if (!experience || experience.trim() === "") {
      return res.json({
        success: false,
        message: "Please enter experience",
      });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `Improve this resume experience in 3-4 professional lines:
${experience}

Do NOT use bullet points or headings.
Return only clean paragraph text.`,
        },
      ],
    });

    const result = cleanText(response?.choices?.[0]?.message?.content);

    res.json({
      success: true,
      improved: result,
    });

  } catch (err) {
    console.log("❌ EXPERIENCE ERROR:", err.message);
    res.json({
      success: false,
      message: "AI failed",
    });
  }
});

module.exports = router;