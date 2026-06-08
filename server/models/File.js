const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  roomId: String,
  fileName: String,
  fileUrl: String,
  uploadedBy: String
}, {
  timestamps: true
});

module.exports = mongoose.model("File", fileSchema);