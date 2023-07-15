const { Schema, model } = require("mongoose");

const CommentReplySchema = new Schema(
  {
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    text: {
      type: String,
      default: "",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
      min: 3,
      max: 20,
      unique: true,
    },
    profilePicture: {
      type: String,
      default: "",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("CommentReply", CommentReplySchema);
