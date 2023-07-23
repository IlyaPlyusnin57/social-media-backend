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
    },
    profilePicture: {
      type: String,
      default: "",
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    likes: {
      type: Array,
      default: [],
      required: true,
    },
    dislikes: {
      type: Array,
      default: [],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("CommentReply", CommentReplySchema);
