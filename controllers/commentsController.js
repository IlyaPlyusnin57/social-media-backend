const Comment = require("../models/Comment");
const CommentReply = require("../models/CommentReply");
const Post = require("../models/Post");
const mongoose = require("mongoose");
const { updatePostCommentCount } = require("../controllers/postsController");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

// create a Comment

async function createComment(req, res) {
  const { type, commentBody, postUserId, commenter } = req.body;
  let comment = null;

  const postId = commentBody.postId;

  if ((await Post.findById(postId).lean()) == null) {
    return res.status(404).json("Post does not exist!");
  }

  const commentObject = {
    id: uuidv4(),
    liker: commenter,
    message: `commented on your`,
    likedUser: postUserId,
    type: "post",
    typeId: postId,
  };

  try {
    if (type === "comment") {
      comment = new Comment(commentBody);
    } else if (type === "commentReply") {
      const replyingToComment = await Comment.findById(commentBody.commentId);

      if (replyingToComment == null) {
        return res.status(404).json("Comment does not exist");
      }

      comment = new CommentReply(commentBody);

      let repliesNum = replyingToComment.replies;
      await replyingToComment.updateOne({ replies: ++repliesNum });
    }

    const newComment = await comment.save();

    await updatePostCommentCount(postId, true, 1);

    if (postUserId !== commentBody.userId) {
      await axios.patch(process.env.UPDATE_NOTIFICATIONS + postUserId, {
        various: commentObject,
      });
    }

    return res.status(200).json({ newComment, commentObject });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

async function getComment(req, res) {
  const postId = req.body.postId;

  if ((await Post.findById(postId).lean()) == null) {
    return res.status(404).json("Post does not exist!");
  }

  try {
    const lastCommentId = req.body.lastCommentId
      ? { _id: { $gt: new mongoose.Types.ObjectId(req.body.lastCommentId) } }
      : {};

    const comments = await Comment.find()
      .and([{ postId: new mongoose.Types.ObjectId(postId) }, lastCommentId])
      .sort({ _id: 1 })
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

async function editComment(req, res) {
  let comment = null;

  try {
    const { postId } = req.body;

    if ((await Post.findById(postId).lean()) == null) {
      return res.status(404).json("Post does not exist!");
    }

    const { commentId, text, type } = req.body;

    if (type === "comment") {
      comment = await Comment.findById(commentId).exec();
    } else if (type === "commentReply") {
      comment = await CommentReply.findById(commentId).exec();
    }

    const { modifiedCount } = await comment.updateOne({ text });

    if (modifiedCount === 1) return res.status(200).json("success!");

    return res.status(400).json("document was not modified!");
  } catch (error) {
    console.log(error);
    return res.status(500).json();
  }
}

async function deleteComment(req, res) {
  try {
    const { postId: id, type, parentCommentId } = req.body;

    if ((await Post.findById(id).lean()) == null) {
      return res.status(404).json("Post does not exist!");
    }

    let comment = null;
    let updateCommentCount = 1;

    if (type === "comment") {
      comment = await Comment.findById(req.params.id).exec();

      const { deletedCount } = await CommentReply.deleteMany({
        commentId: new mongoose.Types.ObjectId(req.params.id),
      });

      updateCommentCount += deletedCount;
    } else if (type === "commentReply") {
      const parentComment = await Comment.findById(parentCommentId).exec();

      let repliesNum = parentComment.replies;
      await parentComment.updateOne({ replies: --repliesNum });

      comment = await CommentReply.findById(req.params.id).exec();
    }

    if (!comment) return res.status(404).json("Comment was not found!");

    const postId = comment.postId;

    const { commenter, userId } = req.body;

    const commentObject = {
      id: uuidv4(),
      liker: commenter,
      message: `deleted a comment on your`,
      likedUser: userId,
      type: "post",
      typeId: comment.postId,
    };

    if (commenter._id !== userId) {
      await axios.patch(process.env.UPDATE_NOTIFICATIONS + userId, {
        various: commentObject,
      });
    }

    await comment.deleteOne();

    await updatePostCommentCount(postId, false, updateCommentCount);

    return res.status(200).json(commentObject);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

async function likeDislikeComment(req, res) {
  try {
    const { post, isLiking, user: liker, type } = req.body;

    let comment = null;

    if (type === "comment") {
      comment = await Comment.findById(req.params.id).exec();
    } else {
      comment = await CommentReply.findById(req.params.id).exec();
    }

    if (comment == null) {
      return res.status(404).json("Comment does not exist!");
    }

    if ((await Post.findById(post._id).lean()) == null) {
      return res.status(404).json("Post does not exist!");
    }

    const likeObject = {
      id: uuidv4(),
      liker: liker,
      message: `liked your`,
      likedUser: comment.userId.toString(),
      type: "comment on post",
      typeId: post._id,
    };

    if (isLiking) {
      if (comment.dislikes.includes(liker._id)) {
        await comment.updateOne({ $pull: { dislikes: liker._id } });
      }

      if (comment.likes.includes(liker._id)) {
        likeObject.message = "removed a like from your";

        await comment.updateOne({ $pull: { likes: liker._id } });
      } else {
        await comment.updateOne({ $push: { likes: liker._id } });
      }
    } else {
      if (comment.likes.includes(liker._id)) {
        await comment.updateOne({ $pull: { likes: liker._id } });
      }

      if (comment.dislikes.includes(liker._id)) {
        likeObject.message = "removed a dislike from your";

        await comment.updateOne({ $pull: { dislikes: liker._id } });
      } else {
        likeObject.message = "disliked your";
        await comment.updateOne({ $push: { dislikes: liker._id } });
      }
    }

    if (liker._id !== comment.userId.toString()) {
      await axios.patch(process.env.UPDATE_NOTIFICATIONS + comment.userId, {
        various: likeObject,
      });
    }

    return res.status(200).json(likeObject);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

module.exports = {
  createComment,
  getComment,
  getCommentReply,
  editComment,
  deleteComment,
  likeDislikeComment,
};
