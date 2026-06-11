const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Groq = require("groq-sdk");
const jwt = require("jsonwebtoken"); // Add JWT verification

// ==================== JWT Authentication Middleware ====================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Access token required" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};

// ==================== RATE LIMITING (Simple in-memory) ====================
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimit.get(ip);
  if (!record) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  record.count++;
  return true;
}

// ==================== MULTER CONFIGURATION ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/ai-resumes");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WEBP images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ==================== GROQ INITIALIZATION ====================
let groq;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  console.log("✅ Groq SDK initialized for AI Resume analysis");
} else {
  console.warn("⚠️ GROQ_API_KEY not set. AI analysis will use fallback.");
}

// ==================== HELPER FUNCTIONS ====================
const imageToBase64 = (imagePath) => {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString("base64");
};

// Updated to use the currently supported Groq vision model (as of 2025)
const analyzeImageWithGroq = async (imageBase64, mimeType) => {
  if (!groq) {
    throw new Error("Groq API key not configured");
  }

  // Use the stable vision model
  const VISION_MODEL = "llama-3.2-11b-vision-preview";
  
  console.log(`🖼️ Using vision model: ${VISION_MODEL}`);

  const prompt = `You are an expert resume layout analyzer. Analyze this resume image carefully and provide a detailed analysis.

IMPORTANT: You MUST identify the EXACT ORDER of sections from TOP to BOTTOM as they appear in the uploaded resume.

Analyze the following aspects:

1. **SECTION ORDER** (MOST IMPORTANT): List the sections in the EXACT order they appear from top to bottom. Possible sections:
   - personal-info (name, title, contact details)
   - summary (professional summary/career objective)
   - skills (technical/professional skills)
   - education (academic qualifications)
   - experience (work history)
   - projects (portfolio projects)
   - certifications (certificates/awards)
   - languages (language proficiency)

2. **LAYOUT STRUCTURE**: Determine if this resume uses SINGLE COLUMN or TWO COLUMN layout.

3. **COLUMN ASSIGNMENT** (for two-column layouts):
   - Which sections appear in the LEFT/SIDEBAR column?
   - Which sections appear in the RIGHT/MAIN column?

4. **COLOR SCHEME**: Identify the primary and accent colors (hex codes).

5. **PROFILE PHOTO**: Does the resume have a profile photo? (true/false)

Return your analysis in this EXACT JSON format (no extra text):

{
  "layoutType": "single-column" or "two-column",
  "sectionOrder": ["section1", "section2", "section3", "section4", "section5", "section6", "section7", "section8"],
  "columnAssignment": {
    "left": ["section1", "section2"],
    "right": ["section3", "section4", "section5"]
  },
  "colors": {
    "primaryColor": "#XXXXXX",
    "accentColor": "#XXXXXX"
  },
  "hasProfilePhoto": true or false,
  "sectionVisibility": {
    "summary": true,
    "skills": true,
    "education": true,
    "experience": true,
    "projects": true,
    "certifications": true,
    "languages": true
  }
}

IMPORTANT RULES:
- The sectionOrder array MUST reflect the exact top-to-bottom order from the image
- If a section doesn't exist in the resume, set its visibility to false
- For single-column layouts, columnAssignment should have empty arrays
- Preserve the original order - don't rearrange sections`;

  try {
    const response = await groq.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    console.log("Groq Vision Analysis Response:", content);

    // Robust JSON extraction: find first '{' and last '}'
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON object found in response");
    }
    let jsonStr = content.substring(firstBrace, lastBrace + 1);
    // Attempt to fix common issues (trailing commas, etc.) - basic cleanup
    jsonStr = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Groq Vision Analysis Error:", error.message);
    throw error;
  }
};

const getDefaultLayout = () => {
  return {
    layoutType: "two-column",
    sectionOrder: ["personal-info", "summary", "skills", "experience", "education", "projects", "certifications", "languages"],
    columnAssignment: {
      left: ["skills", "certifications", "languages"],
      right: ["summary", "experience", "education", "projects"]
    },
    colors: {
      primaryColor: "#2563eb",
      accentColor: "#7c3aed"
    },
    hasProfilePhoto: false,
    sectionVisibility: {
      summary: true,
      skills: true,
      education: true,
      experience: true,
      projects: true,
      certifications: true,
      languages: true
    }
  };
};

const getSectionDisplayTitle = (sectionKey) => {
  const titles = {
    "personal-info": "Personal Information",
    summary: "Professional Summary",
    skills: "Core Competencies",
    education: "Education",
    experience: "Work Experience",
    projects: "Projects",
    certifications: "Certifications",
    languages: "Languages",
  };
  return titles[sectionKey] || sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
};

// ==================== MAIN ENDPOINT (with authentication) ====================
router.post("/clone-layout", verifyToken, upload.single("layoutImage"), async (req, res) => {
  const startTime = Date.now();
  console.log("🤖 AI Resume Layout Analysis Started");
  
  const clientIp = req.ip || req.connection.remoteAddress;
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  }

  let uploadedFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded. Please upload a resume image.",
      });
    }
    uploadedFilePath = req.file.path;
    console.log(`📸 Image received: ${req.file.filename}`);
    console.log(`📏 Image size: ${(req.file.size / 1024).toFixed(2)} KB`);

    let profileData = {};
    if (req.body.profileData) {
      try {
        profileData = JSON.parse(req.body.profileData);
        console.log("📋 Profile data received");
      } catch (e) {
        console.warn("Could not parse profile data:", e.message);
      }
    }

    const imageBase64 = imageToBase64(uploadedFilePath);
    const mimeType = req.file.mimetype;

    let analysis;
    try {
      console.log("🔍 Analyzing resume layout with AI vision...");
      analysis = await analyzeImageWithGroq(imageBase64, mimeType);
      console.log("📊 Analysis Result:", JSON.stringify(analysis, null, 2));
    } catch (visionError) {
      console.error("Vision analysis failed, using fallback:", visionError.message);
      analysis = getDefaultLayout();
    }

    const layoutType = analysis.layoutType === "two-column" ? "two-column" : "single-column";
    const sectionOrder = analysis.sectionOrder || getDefaultLayout().sectionOrder;
    const columnAssignment = analysis.columnAssignment || { left: [], right: [] };
    const colors = analysis.colors || { primaryColor: "#2563eb", accentColor: "#7c3aed" };
    const hasProfilePhoto = analysis.hasProfilePhoto || false;
    const sectionVisibility = analysis.sectionVisibility || getDefaultLayout().sectionVisibility;

    const sections = {};
    const allSections = ["summary", "skills", "education", "experience", "projects", "certifications", "languages"];
    
    // Build sections based on AI's columnAssignment and order
    sectionOrder.forEach((sectionKey, orderIndex) => {
      if (sectionKey !== "personal-info" && allSections.includes(sectionKey)) {
        let column = "main";
        if (layoutType === "two-column") {
          // Respect AI's columnAssignment if available, otherwise fallback to heuristic
          if (columnAssignment.left?.includes(sectionKey)) {
            column = "left";
          } else if (columnAssignment.right?.includes(sectionKey)) {
            column = "right";
          } else {
            // Fallback: typical sections go to left or right
            const defaultLeft = ["skills", "certifications", "languages"];
            column = defaultLeft.includes(sectionKey) ? "left" : "right";
          }
        }
        sections[sectionKey] = {
          visible: sectionVisibility[sectionKey] !== false,
          column: column,
          customTitle: getSectionDisplayTitle(sectionKey),
          hasBottomBorder: false,
          hasLeftBorder: column === "left",
          spacingBelow: "20px",
          innerPadding: "0px",
          titleFontSize: "16px",
          uppercaseTitle: false,
          order: orderIndex
        };
      }
    });
    
    // Add any missing sections
    allSections.forEach(sectionKey => {
      if (!sections[sectionKey]) {
        const column = (layoutType === "two-column" && ["skills", "certifications", "languages"].includes(sectionKey)) ? "left" : "right";
        sections[sectionKey] = {
          visible: true,
          column: column,
          customTitle: getSectionDisplayTitle(sectionKey),
          hasBottomBorder: false,
          hasLeftBorder: column === "left",
          spacingBelow: "20px",
          innerPadding: "0px",
          titleFontSize: "16px",
          uppercaseTitle: false,
          order: 999
        };
      }
    });

    let columnWidths = "1fr 2fr";
    if (layoutType === "two-column") {
      const leftSectionsCount = Object.values(sections).filter(s => s.column === "left" && s.visible).length;
      if (leftSectionsCount === 0) {
        columnWidths = "1fr";
      }
    } else {
      columnWidths = "1fr";
    }

    const responseData = {
      success: true,
      layout: {
        layoutType: layoutType,
        columnRatio: layoutType === "two-column" ? "30/70" : "100",
        sections: sections,
        globalStyles: {
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          primaryColor: colors.primaryColor,
          accentColor: colors.accentColor,
          pagePadding: "40px",
          lineHeight: "1.5",
          headerAlignment: "left",
          backgroundColor: "#ffffff",
          titleFontSize: "18px",
          bodyFontSize: "14px",
        },
      },
      primaryColor: colors.primaryColor,
      accentColor: colors.accentColor,
      sectionOrder: sectionOrder,
      analyzedAt: new Date().toISOString(),
      imageAnalyzed: req.file.originalname,
      analysisMethod: "ai-vision-analysis",
      imageDimensions: {
        width: null,
        height: null,
      },
      processingTime: `${((Date.now() - startTime) / 1000).toFixed(2)}s`,
      requestId: `req_${Date.now()}`,
      hasProfilePhoto: hasProfilePhoto,
    };

    console.log("✅ AI Analysis Complete!");
    console.log(`   Layout: ${layoutType}`);
    console.log(`   Section Order: ${sectionOrder.join(" → ")}`);
    console.log(`   Primary Color: ${colors.primaryColor}`);
    console.log(`   Processing Time: ${responseData.processingTime}`);

    res.json(responseData);
    
  } catch (error) {
    console.error("❌ AI Layout Analysis Error:", error.message);
    
    // Fallback response
    const defaultLayout = getDefaultLayout();
    const fallbackSections = {};
    defaultLayout.sectionOrder.forEach((sectionKey, idx) => {
      if (sectionKey !== "personal-info") {
        const column = (defaultLayout.layoutType === "two-column" && defaultLayout.columnAssignment.left?.includes(sectionKey)) ? "left" : "right";
        fallbackSections[sectionKey] = {
          visible: true,
          column: column,
          customTitle: getSectionDisplayTitle(sectionKey),
          hasBottomBorder: false,
          hasLeftBorder: column === "left",
          spacingBelow: "20px",
          innerPadding: "0px",
          titleFontSize: "16px",
          uppercaseTitle: false,
          order: idx
        };
      }
    });

    const fallbackResponse = {
      success: true,
      layout: {
        layoutType: defaultLayout.layoutType,
        columnRatio: "30/70",
        sections: fallbackSections,
        globalStyles: {
          fontFamily: "Inter, system-ui, sans-serif",
          primaryColor: defaultLayout.colors.primaryColor,
          accentColor: defaultLayout.colors.accentColor,
          pagePadding: "40px",
          lineHeight: "1.5",
          headerAlignment: "left",
          backgroundColor: "#ffffff",
          titleFontSize: "18px",
          bodyFontSize: "14px",
        },
      },
      primaryColor: defaultLayout.colors.primaryColor,
      accentColor: defaultLayout.colors.accentColor,
      sectionOrder: defaultLayout.sectionOrder,
      analyzedAt: new Date().toISOString(),
      imageAnalyzed: req.file?.originalname || "unknown",
      analysisMethod: "fallback",
      processingTime: `${((Date.now() - startTime) / 1000).toFixed(2)}s`,
      hasProfilePhoto: false,
      isFallback: true,
    };

    res.json(fallbackResponse);
  } finally {
    // ✅ Always delete temporary file
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlink(uploadedFilePath, (err) => {
        if (err) console.error("Error deleting temp file:", err);
        else console.log("🗑️ Temp file deleted:", uploadedFilePath);
      });
    }
  }
});

// ==================== TEST & STATUS ENDPOINTS ====================
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "AI Resume API is working",
    groqConfigured: !!process.env.GROQ_API_KEY,
    visionModel: "llama-3.2-11b-vision-preview",
    features: {
      sectionOrderDetection: true,
      columnDetection: true,
      colorDetection: true,
      profilePhotoDetection: true
    }
  });
});

router.get("/status", (req, res) => {
  res.json({
    success: true,
    groqConfigured: !!process.env.GROQ_API_KEY,
    service: "AI Resume Layout Analyzer",
    capabilities: {
      detectsSectionOrder: true,
      detectsLayoutType: true,
      detectsColors: true,
      detectsProfilePhoto: true
    },
    endpoints: {
      cloneLayout: "POST /api/ai/clone-layout",
      test: "GET /api/ai/test",
      status: "GET /api/ai/status",
    },
  });
});

module.exports = router;