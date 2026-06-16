const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  template: { type: String, default: 't1' },
  colorSettings: {
    primaryColor: { type: String, default: '#4f46e5' },
    accentColor: { type: String, default: '#818cf8' }
  },
  aiManifest: { type: Object, default: null },
  data: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

resumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Resume', resumeSchema);