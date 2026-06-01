const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ["user", "admin", "moderator"],
    default: "user"
  },
  status: {
    type: String,
    enum: ["active", "blocked", "inactive", "pending"],
    default: "active"
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginCount: {
    type: Number,
    default: 0
  },
  profilePicture: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "light"
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      sms: { type: Boolean, default: false }
    },
    language: {
      type: String,
      default: "en"
    }
  },
  refreshToken: {
    type: String,
    default: null
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    default: null
  },
  apiKey: {
    type: String,
    default: null
  },
  lastPasswordChange: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }
}, { 
  timestamps: true 
});

// REMOVE ALL pre('save') MIDDLEWARE - This is the key fix
// Do not add any middleware here at all

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login - Use findByIdAndUpdate to avoid any middleware
UserSchema.methods.updateLastLogin = async function() {
  const User = mongoose.model("User");
  return await User.findByIdAndUpdate(
    this._id,
    { 
      $set: { 
        lastLogin: new Date(),
        lastActive: new Date()
      },
      $inc: { loginCount: 1 }
    },
    { new: true }
  );
};

// Get public profile
UserSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    status: this.status,
    profilePicture: this.profilePicture,
    location: this.location,
    bio: this.bio,
    createdAt: this.createdAt,
    lastActive: this.lastActive
  };
};

// Check if user is admin
UserSchema.methods.isAdmin = function() {
  return this.role === "admin";
};

// Check if user is active
UserSchema.methods.isActive = function() {
  return this.status === "active";
};

// Soft delete user
UserSchema.methods.softDelete = async function(deletedBy) {
  const User = mongoose.model("User");
  return await User.findByIdAndUpdate(
    this._id,
    {
      $set: {
        status: "inactive",
        deletedAt: new Date(),
        deletedBy: deletedBy
      }
    },
    { new: true }
  );
};

// Restore soft deleted user
UserSchema.methods.restore = async function() {
  const User = mongoose.model("User");
  return await User.findByIdAndUpdate(
    this._id,
    {
      $set: {
        status: "active",
        deletedAt: null,
        deletedBy: null
      }
    },
    { new: true }
  );
};

// Static method to get active users count
UserSchema.statics.getActiveCount = async function() {
  return await this.countDocuments({ status: "active" });
};

// Static method to get blocked users count
UserSchema.statics.getBlockedCount = async function() {
  return await this.countDocuments({ status: "blocked" });
};

// Static method to get new users count (last 7 days)
UserSchema.statics.getNewUsersCount = async function(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return await this.countDocuments({ createdAt: { $gte: date } });
};

// Static method to find by email with case-insensitive search
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Virtual for full name
UserSchema.virtual("fullName").get(function() {
  return this.name;
});

// Virtual for isDeleted status
UserSchema.virtual("isDeleted").get(function() {
  return this.deletedAt !== null;
});

// Ensure virtuals are included in JSON output
UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", UserSchema);