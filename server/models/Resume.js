const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true   
    },
    data: {
      type: Object,
      required: true   
    },
    template: {
      type: String,
      default: "default"  
    }
  },
  {
    timestamps: true   
  }
);

module.exports = mongoose.model("Resume", ResumeSchema);