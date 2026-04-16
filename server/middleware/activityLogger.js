// backend/middleware/activityLogger.js

const Activity = require("../models/Activity");

const logActivity = async (req, userId, type, description) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(userId);
    
    if (!user) return;
    
    await Activity.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      type: type,
      description: description,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
  } catch (err) {
    console.error("Error logging activity:", err);
  }
};

module.exports = logActivity;