const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  name: String,
  email: String,
  phone: String,
  address: String,
  role: String,
  linkedin: String,
  github: String,
  twitter: String,
  about: String,
  skills: String,
  experience: String,
  projects: String,
  certificates: String,
  languages: String,

  tenthSchool: String,
  tenthPercentage: String,
  tenthYear: String,

  interCollege: String,
  interCourse: String,
  interPercentage: String,
  interYear: String,

  degreeCollege: String,
  degreeCourse: String,
  degreePercentage: String,
  degreeYear: String,

  profilePhoto: String,
  portfolioUrl: String,
  
  // ✅ ADD THIS FIELD - Track if user has created a portfolio
  hasPortfolio: {
    type: Boolean,
    default: false
  },
  
  // Optional: Track when portfolio was created
  portfolioCreatedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Profile", ProfileSchema);