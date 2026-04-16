// backend/models/Activity.js

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
    enum: ["login", "resume_created", "resume_updated", "portfolio_created", "export_pdf", "profile_updated"],
    required: true
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
  }
}, { timestamps: true });

module.exports = mongoose.model("Activity", ActivitySchema);