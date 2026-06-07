// test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendTestEmail() {
  console.log("📧 Testing email send...");
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"AI Resume Builder" <${process.env.EMAIL_USER}>`,
    to: 'girishdaiwik222@gmail.com', // Your test email
    subject: 'Test Email from AI Resume Builder',
    text: 'This is a test email to verify email configuration.',
    html: '<h1>Test Email</h1><p>If you receive this, your email configuration is working!</p>'
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("❌ Failed to send test email:");
    console.error("Error:", error.message);
    console.error("Full error:", error);
    
    if (error.message.includes("Invalid login")) {
      console.log("\n💡 Your app password is INCORRECT!");
      console.log("Please generate a new app password:");
      console.log("1. Go to: https://myaccount.google.com/apppasswords");
      console.log("2. Generate new password for 'AI Resume Builder'");
      console.log("3. Copy the 16-character password");
      console.log("4. Update EMAIL_PASS in .env file");
    }
  }
}

sendTestEmail();