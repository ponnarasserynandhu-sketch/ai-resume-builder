const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const axios = require("axios");
const User = require("../models/User");
const logActivity = require("../middleware/activityLogger");

// ==================== EMAIL CONFIGURATION (Brevo HTTP API) ====================
const sendResetEmail = async (email, resetToken, baseUrl) => {
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured. Please add it to .env");
  }

  const textContent = `
PASSWORD RESET REQUEST - AI RESUME BUILDER

Hello,

We received a request to reset the password for your AI Resume Builder account.

Click this link to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email.

Best regards,
AI Resume Builder Team
`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>Password Reset</title></head>
    <body style="font-family: Arial, sans-serif; margin:0; padding:20px; background:#f4f7fb;">
      <div style="max-width:500px; margin:0 auto; background:white; border-radius:10px; padding:30px;">
        <h1 style="color:#6366f1; margin-top:0;">AI Resume Builder</h1>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below:</p>
        <div style="text-align:center; margin:30px 0;">
          <a href="${resetUrl}" style="background:#6366f1; color:white; padding:12px 28px; text-decoration:none; border-radius:6px;">Reset Password</a>
        </div>
        <p>Or copy this link: <br><span style="color:#6366f1;">${resetUrl}</span></p>
        <p style="color:#dc2626;">⏰ Link expires in 1 hour.</p>
        <p>If you didn't request this, ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "AI Resume Builder",
          email: "nandhugirish9104@gmail.com", // Must be verified in Brevo
        },
        to: [{ email }],
        subject: "Reset Your AI Resume Builder Password",
        htmlContent,
        textContent,
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Brevo API error details:", error.response?.data || error.message);
    throw error;
  }
};

// Check API key on startup
if (process.env.BREVO_API_KEY) {
  console.log("✅ Brevo HTTP API key configured");
} else {
  console.warn("⚠️ BREVO_API_KEY missing – password reset emails will fail");
}

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

// ==================== FORGOT PASSWORD ====================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    console.log(`\n📧 Password reset requested for: ${email}`);

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide your email address" 
      });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.json({ 
        success: true, 
        message: "If an account exists with this email, you will receive a password reset link." 
      });
    }

    console.log(`✅ User found: ${user.name} (${user.email}) - Status: ${user.status}`);

    if (user.status !== "active") {
      console.log(`⚠️ User not active: ${email}`);
      return res.json({ 
        success: true, 
        message: "If an account exists with this email, you will receive a password reset link." 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    user.resetPasswordToken = resetToken;
    user.passwordResetToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    user.passwordResetExpires = Date.now() + 3600000;
    
    await user.save();
    console.log(`✅ Reset token generated and saved`);

    // Send email
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    console.log(`🔗 Reset link: ${resetUrl}`);
    
    try {
      const result = await sendResetEmail(email, resetToken, baseUrl);
      console.log(`✅ Email SENT successfully to: ${email}`);
      console.log(`📧 Message ID: ${result.messageId}`);
    } catch (emailError) {
      console.error(`❌ Email sending FAILED: ${emailError.message}`);
    }

    res.json({ 
      success: true, 
      message: "If an account exists with this email, you will receive a password reset link." 
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Unable to process password reset request. Please try again later." 
    });
  }
});

// ==================== RESET PASSWORD ====================
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide token and new password" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters" 
      });
    }

    const user = await User.findOne({
      $or: [
        { resetPasswordToken: token },
        { passwordResetToken: token }
      ],
      $or: [
        { resetPasswordExpires: { $gt: Date.now() } },
        { passwordResetExpires: { $gt: Date.now() } }
      ]
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Password reset token is invalid or has expired. Please request a new reset link." 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.passwordResetToken = null;
    user.resetPasswordExpires = null;
    user.passwordResetExpires = null;
    user.lastPasswordChange = new Date();
    
    await user.save();

    console.log(`✅ Password reset successful for user: ${user.email}`);

    res.json({ 
      success: true, 
      message: "Password has been reset successfully. Please login with your new password." 
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Unable to reset password. Please try again later." 
    });
  }
});

// ==================== VERIFY RESET TOKEN ====================
router.post("/verify-reset-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: "Token is required" 
      });
    }

    const user = await User.findOne({
      $or: [
        { resetPasswordToken: token },
        { passwordResetToken: token }
      ],
      $or: [
        { resetPasswordExpires: { $gt: Date.now() } },
        { passwordResetExpires: { $gt: Date.now() } }
      ]
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Password reset token is invalid or has expired." 
      });
    }

    res.json({ 
      success: true, 
      message: "Token is valid" 
    });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// TEMPORARY ROUTE - CREATE ADMIN
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