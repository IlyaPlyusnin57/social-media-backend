const Comment = require("../models/Comment");
const CommentReply = require("../models/CommentReply");
const mongoose = require("mongoose");

// create a Comment

async function createComment(req, res) {
  const { type, commentBody } = req.body;
  let comment = null;

  try {
    if (type === "comment") {
      comment = new Comment(commentBody);
    } else if (type === "commentReply") {
      comment = new CommentReply(commentBody);
    }

    const newComment = await comment.save();
    return res.status(200).json(newComment);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

async function getComment(req, res) {
  try {
    const lastCommentId = req.body.lastCommentId
      ? { _id: { $lt: new mongoose.Types.ObjectId(req.body.lastCommentId) } }
      : {};

    const comments = await Comment.find()
      .and([{ postId: req.body.postId }, lastCommentId])
      .sort({ _id: -1 })
      .limit(5)
      .lean();

    res.status(200).json(comments);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

async function getCommentReply(req, res) {
  try {
    const lastCommentReplyId = req.body.lastCommentReplyId
      ? {
          _id: {
            $lt: new mongoose.Types.ObjectId(req.body.lastCommentReplyId),
          },
        }
      : {};

    const comments = await CommentReply.find()
      .and([{ commentId: req.body.commentId }, lastCommentReplyId])
      .sort({ _id: -1 })
      .limit(5)
      .lean();

    res.status(200).json(comments);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

module.exports = {
  createComment,
  getComment,
  getCommentReply,
};
