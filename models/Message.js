const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    message: { type: String },
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
