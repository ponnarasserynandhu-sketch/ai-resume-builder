const Profile = require("../models/Profile");

// SAVE PROFILE
exports.saveProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    let photo = "";
    if (req.file) {
      photo = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const data = { ...req.body };
    if (photo) data.profilePhoto = photo;

    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: { userId, ...data } },
      { new: true, upsert: true }
    );

    res.json({ success: true, profile });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });

    res.json({ success: true, profile: profile || {} });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};