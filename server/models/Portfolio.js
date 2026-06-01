const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    default: "My Portfolio"
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  lastViewedAt: {
    type: Date,
    default: null
  },
  shareableLink: {
    type: String,
    unique: true,
    sparse: true
  },
  theme: {
    type: String,
    enum: ["modern", "classic", "minimal", "creative"],
    default: "modern"
  },
  customCss: {
    type: String,
    default: ""
  },
  sections: {
    type: Object,
    default: {
      about: true,
      skills: true,
      experience: true,
      education: true,
      projects: true,
      certificates: true,
      contact: true
    }
  },
  socialLinks: {
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    twitter: { type: String, default: "" },
    instagram: { type: String, default: "" },
    facebook: { type: String, default: "" }
  },
  colorScheme: {
    primary: { type: String, default: "#6366f1" },
    secondary: { type: String, default: "#8b5cf6" },
    accent: { type: String, default: "#10b981" }
  },
  seo: {
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    keywords: { type: String, default: "" }
  }
}, { timestamps: true });

// Pre-save hook - COMMENTED OUT TO FIX THE ERROR
// PortfolioSchema.pre('save', function(next) {
//   if (!this.shareableLink && this.userId) {
//     const userId = this.userId.toString();
//     this.shareableLink = `/portfolio/${userId}`;
//   }
//   next();
// });

module.exports = mongoose.model("Portfolio", PortfolioSchema);