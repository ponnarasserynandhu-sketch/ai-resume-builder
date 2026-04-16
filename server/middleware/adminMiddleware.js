const User = require("../models/User");
// const Admin = require("../models/Admin"); // Uncomment if you create Admin model

module.exports = async function (req, res, next) {
  try {
    // Check if user exists in request
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    
    // First try to find in User collection
    let user = await User.findById(req.user.id).select("-password");
    let isAdmin = false;
    
    if (user && user.role === "admin") {
      isAdmin = true;
    }
    
    // Optionally check Admin collection if you create it
    // if (!isAdmin) {
    //   const admin = await Admin.findById(req.user.id).select("-password");
    //   if (admin) {
    //     isAdmin = true;
    //     user = admin;
    //   }
    // }
    
    if (!user || !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Admin privileges required." 
      });
    }
    
    // Attach admin user to request
    req.adminUser = user;
    
    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error in admin authorization" 
    });
  }
};