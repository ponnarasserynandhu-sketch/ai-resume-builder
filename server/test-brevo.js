require('dotenv').config();
const nodemailer = require('nodemailer');

async function testBrevo() {
  console.log('Testing Brevo SMTP...');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // 587 uses TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true, // shows SMTP conversation
  });

  try {
    let info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"AI Resume Builder" <nandhugirish9104@gmail.com>',
      to: 'your_test_email@gmail.com', // CHANGE TO YOUR EMAIL
      subject: 'Brevo SMTP Test',
      text: 'If you receive this, Brevo is working!',
    });
    console.log('✅ Email sent! Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

testBrevo();
