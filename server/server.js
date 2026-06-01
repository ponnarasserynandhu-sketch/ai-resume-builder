// server.js
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// Create necessary directories
const directories = ["uploads", "uploads/ai-resumes", "logs", "temp"];
directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// ==================== MIDDLEWARE ====================
// Dynamic CORS for production
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://ai-resume-builder-zeta-dusky.vercel.app",  // ← ADD YOUR SPECIFIC URL
  "https://ai-resume-builder.vercel.app",
  "https://ai-resume-builder.netlify.app",
  process.env.FRONTEND_URL
].filter(Boolean);

console.log("🔧 Allowed CORS origins:", allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==================== HEALTH CHECK ====================
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    environment: process.env.NODE_ENV || "development"
  });
});

// ==================== ROUTES ====================

// Auth routes
try {
  app.use("/api/auth", require("./routes/auth"));
  console.log("✅ Auth routes loaded");
} catch (err) {
  console.warn("⚠️ Auth routes not found");
}

// User routes (for getting user info)
try {
  app.use("/api/user", require("./routes/user"));
  console.log("✅ User routes loaded");
} catch (err) {
  console.warn("⚠️ User routes not found");
}

// Profile routes
try {
  app.use("/api/profile", require("./routes/profile"));
  console.log("✅ Profile routes loaded");
} catch (err) {
  console.warn("⚠️ Profile routes not found");
}

// Resume routes
try {
  app.use("/api/resume", require("./routes/resume"));
  console.log("✅ Resume routes loaded");
} catch (err) {
  console.warn("⚠️ Resume routes not found");
}

// Dashboard routes
try {
  app.use("/api/dashboard", require("./routes/dashboard"));
  console.log("✅ Dashboard routes loaded");
} catch (err) {
  console.warn("⚠️ Dashboard routes not found");
}

// Admin routes
try {
  app.use("/api/admin", require("./routes/admin"));
  console.log("✅ Admin routes loaded");
} catch (err) {
  console.warn("⚠️ Admin routes not found");
}

// Portfolio routes
try {
  app.use("/api/portfolio", require("./routes/portfolio"));
  console.log("✅ Portfolio routes loaded");
} catch (err) {
  console.warn("⚠️ Portfolio routes not found");
}

// Settings routes
try {
  const settingsRoutes = require("./routes/settings");
  app.use("/api/settings", settingsRoutes);
  console.log("✅ Settings routes loaded");
} catch (err) {
  console.warn("⚠️ Settings routes not found:", err.message);
}

// ==================== AI ROUTES ====================

// AI Text routes (summary, skills, experience)
try {
  const aiRoutes = require("./routes/ai");
  app.use("/api/ai", aiRoutes);
  console.log("✅ AI Text Routes loaded");
} catch (err) {
  console.error("❌ Failed to load AI Text routes:", err.message);
}

// AI Resume Layout routes (clone-layout)
try {
  const aiResumeRoutes = require("./routes/aiResume");
  if (aiResumeRoutes) {
    app.use("/api/ai", aiResumeRoutes);
    console.log("✅ AI Resume Layout Routes loaded");
  }
} catch (err) {
  console.error("❌ Failed to load AI Resume Layout routes:", err.message);
}

// ==================== SERVE FRONTEND (Production) ====================
if (process.env.NODE_ENV === "production") {
  // Serve static files from the React frontend build
  const frontendBuildPath = path.join(__dirname, "../build");
  if (fs.existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(frontendBuildPath, "index.html"));
    });
    console.log("✅ Serving frontend from build directory");
  } else {
    console.warn("⚠️ Frontend build not found. Run 'npm run build' in the frontend directory");
  }
}

// ==================== ERROR HANDLING ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

// ==================== DATABASE CONNECTION & START SERVER ====================
const PORT = process.env.PORT || 5000;

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
    .then(() => {
      console.log("✅ MongoDB Connected");
      startServer();
    })
    .catch(err => {
      console.error("❌ MongoDB Error:", err.message);
      console.log("⚠️ Starting server without database connection...");
      startServer();
    });
} else {
  console.warn("⚠️ MONGO_URI not provided");
  startServer();
}

function startServer() {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`\n📋 Available Endpoints:`);
    console.log(`\n🔐 Auth & User:`);
    console.log(`   POST /api/auth/login - User login`);
    console.log(`   POST /api/auth/register - User register`);
    console.log(`   GET  /api/user/me - Get current user`);
    console.log(`\n🤖 AI Routes:`);
    console.log(`   POST /api/ai/summary - AI Summary`);
    console.log(`   POST /api/ai/skills - AI Skills`);
    console.log(`   POST /api/ai/experience - AI Experience`);
    console.log(`   POST /api/ai/clone-layout - AI Layout Clone`);
    console.log(`\n⚙️ Settings Routes:`);
    console.log(`   GET  /api/settings/settings - Get system settings`);
    console.log(`   GET  /api/settings/health - Get health`);
    console.log(`\n✅ Server ready!\n`);
  });
}

module.exports = app;