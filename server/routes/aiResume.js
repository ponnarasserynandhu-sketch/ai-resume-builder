const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Groq = require("groq-sdk");

// Configure multer for image upload
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
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Initialize Groq
let groq;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  console.log("✅ Groq SDK initialized for AI Resume analysis");
} else {
  console.warn("⚠️ GROQ_API_KEY not set for AI Resume analysis");
}

// Helper function to convert image to base64
const imageToBase64 = (imagePath) => {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString("base64");
};

// Helper function to analyze image with Groq Vision
const analyzeImageWithGroq = async (imageBase64, mimeType) => {
  if (!groq) {
    throw new Error("Groq API key not configured");
  }

  const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
  
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

    let jsonStr = content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Groq Vision Analysis Error:", error.message);
    throw error;
  }
};

// Default layout for fallback (standard order)
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

// Helper function to get section display title
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

// Main endpoint for AI layout analysis
router.post("/clone-layout", upload.single("layoutImage"), async (req, res) => {
  const startTime = Date.now();
  console.log("🤖 AI Resume Layout Analysis Started");

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded. Please upload a resume image.",
      });
    }

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

    const imageBase64 = imageToBase64(req.file.path);
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

    // Build the sections object in the EXACT order detected from the image
    const sections = {};
    
    // Define all possible sections with their properties
    const allSections = ["summary", "skills", "education", "experience", "projects", "certifications", "languages"];
    
    // Process sections in the order detected by AI
    sectionOrder.forEach((sectionKey, orderIndex) => {
      if (sectionKey !== "personal-info" && allSections.includes(sectionKey)) {
        // Determine which column this section belongs to
        let column = "main";
        if (layoutType === "two-column") {
          if (columnAssignment.left?.includes(sectionKey)) {
            column = "left";
          } else if (columnAssignment.right?.includes(sectionKey)) {
            column = "right";
          } else {
            // Default column assignment based on common patterns
            const leftSections = ["skills", "certifications", "languages"];
            column = leftSections.includes(sectionKey) ? "left" : "right";
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
          order: orderIndex // Preserve the exact order from the image
        };
      }
    });
    
    // Add any missing sections (in case AI didn't detect them) at the end
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
          order: 999 // Put missing sections at the end
        };
      }
    });

    // Set column widths based on layout type
    let columnWidths = "1fr 2fr";
    if (layoutType === "two-column") {
      const leftSectionsCount = Object.values(sections).filter(s => s.column === "left" && s.visible).length;
      if (leftSectionsCount === 0) {
        columnWidths = "1fr";
      }
    } else {
      columnWidths = "1fr";
    }

    // Prepare the response in the format expected by frontend
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
      sectionOrder: sectionOrder, // Send the detected order to frontend
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

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting temp file:", err);
      else console.log("🗑️ Temp file deleted:", req.file.filename);
    });

    res.json(responseData);
    
  } catch (error) {
    console.error("❌ AI Layout Analysis Error:", error.message);

    // Clean up file if it exists
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    // Return fallback response
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
  }
});

// Test endpoint
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "AI Resume API is working",
    groqConfigured: !!process.env.GROQ_API_KEY,
    visionModel: "meta-llama/llama-4-scout-17b-16e-instruct",
    features: {
      sectionOrderDetection: true,
      columnDetection: true,
      colorDetection: true,
      profilePhotoDetection: true
    }
  });
});

// Status endpoint
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