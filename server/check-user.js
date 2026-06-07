// check-user.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    
    const email = 'girishdaiwik222@gmail.com';
    const user = await User.findOne({ email });
    
    if (user) {
      console.log(`✅ User FOUND: ${email}`);
      console.log("Name:", user.name);
      console.log("Status:", user.status);
    } else {
      console.log(`❌ User NOT FOUND: ${email}`);
      console.log("\n💡 You need to REGISTER this email first!");
      console.log("Please sign up with this email before requesting password reset.");
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

checkUser();