const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
{
  roomId: String,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  code: {
    type: String,
    default: "// Start coding here"
  },

  whiteboard: {
  type: Array,
  default: []
},
  activities: [
  {
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
],

  messages: [
    {
      username: String,
      message: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]



},
{
  timestamps: true
}
);
module.exports = mongoose.model("Room", roomSchema);