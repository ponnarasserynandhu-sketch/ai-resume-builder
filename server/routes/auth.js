const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const logActivity = require("../middleware/activityLogger");

// ==================== EMAIL CONFIGURATION ====================
const nodemailer = require("nodemailer");

// Configure email transporter based on service type
let emailTransporter;

if (process.env.EMAIL_SERVICE === "sendgrid") {
  emailTransporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
      user: 'apikey',
      pass: process.env.EMAIL_PASS
    }
  });
  console.log("📧 Using SendGrid email service");
} else if (process.env.EMAIL_SERVICE === "ethereal") {
  emailTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log("📧 Using Ethereal email service (testing)");
} else {
  emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log("📧 Using Gmail email service");
}

// Verify email configuration
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  emailTransporter.verify((error, success) => {
    if (error) {
      console.error("❌ Email transporter error:", error.message);
    } else {
      console.log("✅ Email server is ready");
    }
  });
} else {
  console.warn("⚠️ Email credentials not configured");
}

// IMPROVED: Function to send reset email with plain text version
const sendResetEmail = async (email, resetToken, baseUrl) => {
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  
  // Plain text version (important for avoiding spam filters)
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

  const mailOptions = {
    from: `"AI Resume Builder" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your AI Resume Builder Password',
    text: textContent,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Password Reset</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f7fb;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0;">AI Resume Builder</h1>
          </div>
          
          <h2 style="color: #1e293b; margin-bottom: 20px;">Reset Your Password</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Hello,
          </p>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset the password for your account. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: #6366f1; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin: 20px 0;">
            Or copy this link: <br>
            <span style="color: #6366f1; word-break: break-all;">${resetUrl}</span>
          </p>
          
          <div style="background: #fef2f2; padding: 12px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #ef4444;">
            <p style="color: #dc2626; font-size: 13px; margin: 0;">
              ⏰ This link expires in 1 hour
            </p>
          </div>
          
          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      </body>
      </html>
    `
  };

  return await emailTransporter.sendMail(mailOptions);
};

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

// ==================== FORGOT PASSWORD - IMPROVED ====================
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
      console.log(`📧 From: ${process.env.EMAIL_USER}`);
      console.log(`📧 To: ${email}`);
      
      // For Ethereal, show preview URL
      if (process.env.EMAIL_SERVICE === "ethereal") {
        console.log(`📧 Preview: ${nodemailer.getTestMessageUrl(result)}`);
      }
    } catch (emailError) {
      console.error(`❌ Email sending FAILED: ${emailError.message}`);
      console.error(`Error details:`, emailError);
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