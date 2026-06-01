const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  // General Settings
  siteName: {
    type: String,
    default: "AI Resume Builder"
  },
  siteEmail: {
    type: String,
    default: "admin@airesume.com"
  },
  siteLogo: {
    type: String,
    default: ""
  },
  siteDescription: {
    type: String,
    default: "AI-powered resume and portfolio builder platform"
  },
  
  // Feature Controls
  allowRegistration: {
    type: Boolean,
    default: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  maxResumesPerUser: {
    type: Number,
    default: 10
  },
  maxPortfoliosPerUser: {
    type: Number,
    default: 5
  },
  
  // AI Settings
  aiSuggestions: {
    type: Boolean,
    default: true
  },
  aiPoweredSummaries: {
    type: Boolean,
    default: true
  },
  
  // Theme Settings
  defaultTheme: {
    type: String,
    enum: ["light", "dark", "auto"],
    default: "light"
  },
  
  // Email Settings
  emailNotifications: {
    type: Boolean,
    default: true
  },
  welcomeEmail: {
    type: Boolean,
    default: true
  },
  
  // Security Settings
  twoFactorAuth: {
    type: Boolean,
    default: false
  },
  sessionTimeout: {
    type: Number,
    default: 60 // minutes
  },
  
  // Backup Settings
  autoBackup: {
    type: Boolean,
    default: true
  },
  backupFrequency: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
    default: "daily"
  },
  
  // Social Links
  socialLinks: {
    facebook: { type: String, default: "" },
    twitter: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    instagram: { type: String, default: "" },
    github: { type: String, default: "" }
  },
  
  // Updated by
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Settings", SettingsSchema);