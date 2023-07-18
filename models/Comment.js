const { Schema, model } = require("mongoose");

const CommentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    username: {
      type: String,
      required: true,
      min: 3,
      max: 20,
    },
    profilePicture: {
      type: String,
      default: "",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Comment", CommentSchema);
