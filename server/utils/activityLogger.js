const ActivityLog = require('../models/ActivityLog');

/**
 * Log a user activity
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {string} userName - Name of the user
 * @param {string} userEmail - Email of the user
 * @param {string} action - Action description (e.g., "Created new resume")
 * @param {string} type - One of: login, resume_created, resume_updated, portfolio_created, export_pdf, profile_update
 * @param {string} details - Optional extra details
 */
const logActivity = async (userId, userName, userEmail, action, type, details = '') => {
  try {
    await ActivityLog.create({
      userId,
      userName,
      userEmail,
      action,
      type,
      details
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};

module.exports = logActivity;