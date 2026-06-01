const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logActivity = require("../middleware/activityLogger");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.json({ success: false, message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    user = new User({ 
      name, 
      email, 
      password: hashed,
      role: "user",
      status: "active",
      lastActive: new Date()
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ 
      success: true, 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    console.log("User found:", user.email, "Role:", user.role, "Status:", user.status);

    // Check if user is blocked
    if (user.status === "blocked") {
      console.log("User blocked:", email);
      return res.status(403).json({ 
        success: false, 
        message: "Your account has been blocked. Please contact admin." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid password for:", email);
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Update last login - use direct update to avoid pre-save hooks
    await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          lastLogin: new Date(),
          lastActive: new Date()
        },
        $inc: { loginCount: 1 }
      }
    );

    // Log login activity
    await logActivity(req, user._id, "login", `${user.name} logged in successfully`);

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("Login successful:", email, "Role:", user.role);

    res.json({ 
      success: true, 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// TEMPORARY ROUTE - CREATE ADMIN (Remove after use)
router.post("/create-admin", async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      return res.json({ 
        success: false, 
        message: "Admin already exists",
        credentials: {
          email: "admin@example.com",
          password: "Admin@123"
        }
      });
    }
    
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    
    const admin = new User({
      name: "Super Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      status: "active",
      lastActive: new Date()
    });
    
    await admin.save();
    
    console.log("✅ Admin user created successfully!");
    
    res.json({ 
      success: true, 
      message: "Admin created successfully!",
      credentials: {
        email: "admin@example.com",
        password: "Admin@123"
      },
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status
      }
    });
  } catch (err) {
    console.error("Error creating admin:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET CURRENT USER
router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.json({ success: false, message: "No token" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    res.json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;