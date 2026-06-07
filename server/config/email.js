const nodemailer = require('nodemailer');

// Configure your email service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const sendResetEmail = async (email, resetToken, baseUrl) => {
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"AI Resume Builder" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - AI Resume Builder',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f7fb;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px 20px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AI Resume Builder</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Professional Resume & Portfolio Platform</p>
          </div>
          
          <!-- Content -->
          <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              Hi there,
            </p>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset the password for your AI Resume Builder account. 
              Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); 
                        color: white; padding: 14px 32px; text-decoration: none; 
                        border-radius: 8px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              Or copy this link to your browser:
            </p>
            
            <p style="background: #f1f5f9; padding: 12px; border-radius: 8px; word-break: break-all; color: #6366f1; font-size: 14px;">
              ${resetUrl}
            </p>
            
            <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <p style="color: #dc2626; font-size: 14px; margin: 0;">
                ⏰ This link will expire in <strong>1 hour</strong>.
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
              If you didn't request this password reset, please ignore this email or 
              <a href="${baseUrl}/contact" style="color: #6366f1; text-decoration: none;">contact support</a> 
              if you have concerns.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              &copy; 2024 AI Resume Builder. All rights reserved.<br>
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };