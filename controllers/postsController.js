const Post = require("../models/Post");
const User = require("../models/User");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

// create a post

async function createPost(req, res) {
  const post = new Post(req.body);

  try {
    const newPost = await post.save();
    res.status(200).json(newPost);
  } catch (error) {
    res.status(500).json(error);
  }
}

// update a post

async function updatePost(req, res) {
  try {
    const post = await Post.findById(req.params.id).exec();
    if (!post) return res.status(404).json("Post was not found!");

    if (post.userId !== req.body.userId)
      return res.status(403).json("Can only update your own post");

    await post.updateOne({ $set: req.body });
    res.status(200).json("Updated the post");
  } catch (error) {
    res.status(500).json(error);
  }
}

async function deletePost(req, res) {
  try {
    const post = await Post.findById(req.params.id).exec();
    if (!post) return res.status(404).json("Post was not found!");

    if (post.userId !== req.body.userId)
      return res.status(403).json("Can only delete your own post");

    await post.deleteOne();
    res.status(200).json("Deleted the post");
  } catch (error) {
    res.status(500).json(error);
  }
}

// like a post (and remove the like)

async function likePost(req, res) {
  const liker = req.body.user;

  try {
    const post = await Post.findById(req.params.id).exec();
    if (!post) return res.status(404).json("Post was not found!");

    const likeObject = {
      id: uuidv4(),
      liker: req.body.user,
      message: `liked your`,
      likedUser: post.userId,
      type: "post",
      typeId: post._id,
    };

    if (post.likes.includes(liker._id)) {
      likeObject.message = "removed a like from your";

      await post.updateOne({ $pull: { likes: liker._id } });
      return res.status(200).json(likeObject);
    }

    await post.updateOne({ $push: { likes: liker._id } });
    await axios.patch(process.env.UPDATE_NOTIFICATIONS + post.userId, {
      various: likeObject,
    });

    res.status(200).json(likeObject);
  } catch (error) {
    res.status(500).json(error);
  }
}

// get a post

async function getPost(req, res) {
  try {
    const post = await Post.findById(req.params.id).exec();
    if (!post) return res.status(404).json("Could not find the post");

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
}

// get all user's posts

async function getUserPosts(req, res) {
  try {
    const posts = await Post.find({ userId: req.params.id }).lean();

    const explain = await Post.find({ userId: req.params.id }).explain();

    console.log(explain.executionStats);

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function getUserPosts2(req, res) {
  try {
    const lastPostId = req.body.lastPostId
      ? { _id: { $lt: new mongoose.Types.ObjectId(req.body.lastPostId) } }
      : {};

    const posts = await Post.find()
      .and([{ userId: req.body.userId }, lastPostId])
      .sort({ _id: -1 })
      .limit(10)
      .lean();

    // const explain = await Post.find()
    //   .and([
    //     { userId: req.body.userId },
    //     { _id: { $lt: new mongoose.Types.ObjectId(req.body.lastPostId) } },
    //   ])
    //   .sort({ _id: -1 })
    //   .limit(10)
    //   .explain();

    // console.log(explain.executionStats);

    res.status(200).json(posts);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error });
  }
}

// get users who liked a post

async function getPostLikers(req, res) {
  try {
    const post = await Post.findById(req.params.id).exec();

    const postLikers = await Promise.all(
      post.likes.map((userId) => User.findById(userId).exec())
    );

    return res.status(200).json(postLikers);
  } catch (error) {
    console.log(error);
  }
}

// get timeline of a user

async function getTimeline(req, res) {
  try {
    const arr = await Post.find({ userId: req.params.id }).exec();
    const user = await User.findById(req.params.id).exec();
    const { following } = user._doc;

    const friendsPosts = await Promise.all(
      following.map((friendId) => {
        return Post.find({ userId: friendId }).exec();
      })
    );

    return res.status(200).json(arr.concat(...friendsPosts));
  } catch (error) {
    res.status(500).json(error);
  }
}

async function getFeedForADay(req, res) {
  const userId = req.params.userId;
  const currDay = req.body.currDay;
  const prevDay = req.body.prevDay;

  const currentDate = new Date();
  const previousDate = new Date();

  currentDate.setDate(currentDate.getDate() - currDay);
  previousDate.setDate(previousDate.getDate() - prevDay);

  const lastPostId = req.body.lastPostId
    ? { _id: { $lt: new mongoose.Types.ObjectId(req.body.lastPostId) } }
    : {};

  try {
    const posts = await Post.find()
      .and([lastPostId, { userId }])
      .and([{ createdAt: { $lte: currentDate, $gte: previousDate } }])
      .sort({ _id: -1 })
      .limit(10)
      .lean();

    return res.status(200).json(posts);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  createPost,
  updatePost,
  deletePost,
  likePost,
  getPost,
  getUserPosts,
  getTimeline,
  getUserPosts2,
  getPostLikers,
  getFeedForADay,
};
