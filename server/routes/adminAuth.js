const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const logActivity = require("../middleware/activityLogger");

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    admin.lastActive = new Date();
    await admin.save();

    const token = jwt.sign(
      { admin: { id: admin._id, role: admin.role, type: "admin" } },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create Super Admin (One-time setup)
router.post("/setup-super-admin", async (req, res) => {
  try {
    const existingSuperAdmin = await Admin.findOne({ role: "super_admin" });
    if (existingSuperAdmin) {
      return res.json({ success: false, message: "Super admin already exists" });
    }

    const hashedPassword = await bcrypt.hash("SuperAdmin@123", 10);
    
    const superAdmin = new Admin({
      name: "Super Admin",
      email: "superadmin@example.com",
      password: hashedPassword,
      role: "super_admin",
      permissions: ["all"]
    });

    await superAdmin.save();
    
    res.json({
      success: true,
      message: "Super admin created!",
      credentials: {
        email: "superadmin@example.com",
        password: "SuperAdmin@123"
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;