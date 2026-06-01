const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      // Auth & Login
      "login", 
      "logout",
      "register",
      "password_changed",
      "password_reset",
      
      // Resume related
      "resume_created", 
      "resume_updated", 
      "resume_deleted",
      "resume_viewed",
      "resume_exported",
      
      // Portfolio related
      "portfolio_created", 
      "portfolio_updated",
      "portfolio_deleted",
      "portfolio_viewed",
      "portfolio_shared",
      
      // Profile related
      "profile_updated", 
      "profile_created",
      "profile_photo_updated",
      
      // PDF & Export
      "export_pdf",
      "export_data",
      "download_resume",
      
      // Admin actions
      "status_updated",
      "settings_updated",
      "security_updated",
      "feature_toggled",
      "data_exported",
      "cache_cleared",
      "data_deleted",
      "maintenance_toggled",
      "system_reset",
      "user_blocked",
      "user_activated",
      "user_deleted",
      
      // AI Features
      "ai_summary_generated",
      "ai_skills_suggested",
      "ai_experience_improved",
      "ai_layout_analyzed",
      
      // System
      "system_started",
      "system_restarted",
      "backup_created",
      "backup_restored"
    ],
    required: true
  },
  action: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    default: ""
  },
  userAgent: {
    type: String,
    default: ""
  },
  details: {
    type: Object,
    default: null
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ["success", "failed", "pending"],
    default: "success"
  },
  duration: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
ActivitySchema.index({ userId: 1 });
ActivitySchema.index({ type: 1 });
ActivitySchema.index({ createdAt: -1 });
ActivitySchema.index({ userEmail: 1 });
ActivitySchema.index({ status: 1 });
ActivitySchema.index({ createdAt: -1, type: 1 });

// Virtual for formatted date
ActivitySchema.virtual("formattedDate").get(function() {
  return this.createdAt ? this.createdAt.toLocaleString() : "";
});

// Method to get activity summary
ActivitySchema.methods.getSummary = function() {
  return {
    id: this._id,
    user: this.userName,
    email: this.userEmail,
    action: this.action || this.description,
    type: this.type,
    time: this.createdAt,
    status: this.status
  };
};

// Static method to get recent activities
ActivitySchema.statics.getRecentActivities = async function(limit = 20) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to get activities by user
ActivitySchema.statics.getByUser = async function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to get activities by type
ActivitySchema.statics.getByType = async function(type, limit = 100) {
  return this.find({ type })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to log an activity (convenience method)
ActivitySchema.statics.log = async function(data) {
  const activity = new this({
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    type: data.type,
    action: data.action || "",
    description: data.description,
    ipAddress: data.ipAddress || "",
    userAgent: data.userAgent || "",
    details: data.details || null,
    metadata: data.metadata || {},
    status: data.status || "success",
    duration: data.duration || 0
  });
  
  return await activity.save();
};

// Ensure virtuals are included in JSON output
ActivitySchema.set("toJSON", { virtuals: true });
ActivitySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Activity", ActivitySchema);