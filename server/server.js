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
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
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
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
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

// Settings routes (NEW)
try {
  const settingsRoutes = require("./routes/settings");
  app.use("/api/settings", settingsRoutes);
  console.log("✅ Settings routes loaded");
  console.log("   ⚙️  GET    /api/settings/settings - Get system settings");
  console.log("   ⚙️  GET    /api/settings/system-info - Get system information");
  console.log("   ⚙️  GET    /api/settings/features - Get platform features");
  console.log("   ⚙️  GET    /api/settings/platform-stats - Get platform statistics");
  console.log("   ⚙️  GET    /api/settings/health - Get system health");
  console.log("   ⚙️  POST   /api/settings/export-data - Export data");
  console.log("   ⚙️  POST   /api/settings/clear-cache - Clear cache");
  console.log("   ⚙️  POST   /api/settings/clear-all-data - Clear all data (DANGER)");
  console.log("   ⚙️  PUT    /api/settings/ - Update settings");
} catch (err) {
  console.warn("⚠️ Settings routes not found:", err.message);
}

// ==================== AI ROUTES ====================

// AI Text routes (summary, skills, experience)
try {
  const aiRoutes = require("./routes/ai");
  app.use("/api/ai", aiRoutes);
  console.log("✅ AI Text Routes loaded");
  console.log("   📝 POST /api/ai/summary - Generate summary");
  console.log("   🔧 POST /api/ai/skills - Suggest skills");
  console.log("   💼 POST /api/ai/experience - Improve experience");
} catch (err) {
  console.error("❌ Failed to load AI Text routes:", err.message);
}

// AI Resume Layout routes (clone-layout)
try {
  const aiResumeRoutes = require("./routes/aiResume");
  if (aiResumeRoutes) {
    app.use("/api/ai", aiResumeRoutes);
    console.log("✅ AI Resume Layout Routes loaded");
    console.log("   🤖 POST /api/ai/clone-layout - Clone resume layout from image");
  }
} catch (err) {
  console.error("❌ Failed to load AI Resume Layout routes:", err.message);
}

// ==================== DATABASE CONNECTION ====================
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err.message));
} else {
  console.warn("⚠️ MONGO_URI not provided");
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

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`\n🔐 Auth & User:`);
  console.log(`   GET  http://localhost:${PORT}/api/user/me - Get current user`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login - User login`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register - User register`);
  console.log(`\n🤖 AI Routes:`);
  console.log(`   POST http://localhost:${PORT}/api/ai/summary - AI Summary`);
  console.log(`   POST http://localhost:${PORT}/api/ai/skills - AI Skills`);
  console.log(`   POST http://localhost:${PORT}/api/ai/experience - AI Experience`);
  console.log(`   POST http://localhost:${PORT}/api/ai/clone-layout - AI Layout Clone`);
  console.log(`\n⚙️ Settings Routes (Admin only):`);
  console.log(`   GET  http://localhost:${PORT}/api/settings/settings - Get system settings`);
  console.log(`   GET  http://localhost:${PORT}/api/settings/system-info - Get system info`);
  console.log(`   GET  http://localhost:${PORT}/api/settings/features - Get features`);
  console.log(`   GET  http://localhost:${PORT}/api/settings/platform-stats - Get stats`);
  console.log(`   GET  http://localhost:${PORT}/api/settings/health - Get health`);
  console.log(`   POST http://localhost:${PORT}/api/settings/export-data - Export data`);
  console.log(`   POST http://localhost:${PORT}/api/settings/clear-cache - Clear cache`);
  console.log(`   POST http://localhost:${PORT}/api/settings/clear-all-data - Clear all data`);
  console.log(`   PUT  http://localhost:${PORT}/api/settings/ - Update settings\n`);
});

module.exports = app;