const User = require("../models/User");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const {
  updateNotifications,
} = require("../controllers/notificationsController");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

// update a user

async function updateUser(req, res) {
  if (req.body.userId !== req.params.id && !req.body.isAdmin) {
    return res.status(403).json("You can update only your account");
  }

  if (req.body.password) {
    const salt = bcrypt.genSaltSync(12);
    req.body.password = bcrypt.hashSync(req.body.password, salt);
  }

  User.findByIdAndUpdate(req.params.id, { $set: req.body }, (err, user) => {
    if (err) return res.status(500).json(err);
    if (!user) return res.status(404).json("user was not found");

    res.status(200).json("Account has been updated");
  });

  //   try {
  //     let user = await User.findById(req.params.id).exec();

  //     if (user === null) return res.status(404).json("User does not exist");

  //     user.updateOne({ $set: req.body }, (err, writeOpResult) => {
  //       if (err) res.status(500).json(err);
  //       else {
  //         res.status(200).json("Account has been updated");
  //       }
  //     });
  //   } catch (error) {
  //     res.status(500).json(error);
  //   }
}

// delete a user

async function deleteUser(req, res) {
  if (req.body.userId !== req.params.id && !req.body.isAdmin) {
    return res.status(403).json("You can delete only your account");
  }

  // const { deletedCount: del } = await User.deleteOne({ _id: req.params.id });

  // return del === 1
  //   ? res.status(200).json("deleted user")
  //   : res.status(404).json("user does not exist");

  User.findByIdAndDelete(req.body.userId, (err, user) => {
    if (err) return res.status(500).json(err);
    if (!user) return res.status(404).json("User does not exist");

    res.status(200).json("Deleted User");
  });
}

// get a user

async function getUser(req, res) {
  User.findById(req.params.id, (err, user) => {
    if (err) return res.status(500).json(err);
    if (!user) return res.status(404).json("User not found");

    const { password, createdAt, updatedAt, __v, ...rest } = user._doc;
    res.status(200).json(rest);
  });
}

// is a user following a user

async function isFollowing(req, res) {
  try {
    const currentUserId = req.body.id;
    const userId = req.params.id;
    const user = await User.findById(userId).exec();
    res.status(200).json(user?.followers.includes(currentUserId));
  } catch (error) {
    console.log("is following error");
    console.log(error);
  }
}

// follow a user

async function followUser(req, res) {
  if (req.params.id === req.body.userId)
    return res.status(403).json("Can't follow yourself");

  let currentUser;
  let user;

  try {
    currentUser = await User.findById(req.body.userId).exec();
    user = await User.findById(req.params.id).exec();
  } catch (err) {
    return res.status(500).json(err.message);
  }

  if (!currentUser || !user) {
    let str = "";
    if (!currentUser) str += req.body.userId;
    if (!user) str += ` ${req.params.id}`;
    return res.status(403).json(`Can't find users with ids: ${str}`);
  }

  if (user.followers.includes(req.body.userId))
    return res.status(403).json("Already following that user");

  const followObject = {
    id: uuidv4(),
    follower: currentUser,
    followedUser: user,
  };

  try {
    await currentUser.updateOne({ $push: { following: req.params.id } });
    await user.updateOne({ $push: { followers: req.body.userId } });

    await axios.patch(process.env.UPDATE_NOTIFICATIONS + user._id, {
      follow: followObject,
    });

    res.status(200).json(followObject);
  } catch (err) {
    res.status(500).json(err);
  }
}

// unfollow a user

async function unfollowUser(req, res) {
  if (req.params.id === req.body.userId)
    return res.status(403).json("Can't unfollow yourself");

  let currentUser;
  let user;

  try {
    currentUser = await User.findById(req.body.userId).exec();
    user = await User.findById(req.params.id).exec();
  } catch (err) {
    return res.status(500).json(err.message);
  }

  if (!currentUser || !user) {
    let str = "";
    if (!currentUser) str += req.body.userId;
    if (!user) str += ` ${req.params.id}`;
    return res.status(403).json(`Can't find users with ids: ${str}`);
  }

  if (!user.followers.includes(req.body.userId))
    return res.status(403).json("Not following that user");

  try {
    await currentUser.updateOne({ $pull: { following: req.params.id } });
    await user.updateOne({ $pull: { followers: req.body.userId } });
    res.status(200).json("Unfollowed the user!");
  } catch (err) {
    res.status(500).json(err);
  }
}

// search users (only the first 5 for the search bar)

async function searchUsers(req, res) {
  try {
    const { name } = req.body;

    if (name === "") {
      return res.status(200).json([]);
    }

    const users = await User.find()
      .or([
        { full_name: { $regex: name, $options: "i" } },
        { username: { $regex: name, $options: "i" } },
      ])
      .limit(5)
      .exec();

    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

// Search all users

async function searchAllUsers(req, res) {
  try {
    const { name } = req.body;

    if (name === "" || !name) {
      return res.status(200).json([]);
    }

    const lastUserId = req.body.lastUserId
      ? {
          _id: { $gt: new mongoose.Types.ObjectId(req.body.lastUserId) },
        }
      : {};

    const users = await User.find()
      .and([
        {
          $or: [
            { full_name: { $regex: name, $options: "i" } },
            { username: { $regex: name, $options: "i" } },
          ],
        },
        { $or: [lastUserId] },
      ])
      .limit(10)
      .lean();

    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

// get all users, an end point for testing purposes

async function getAllUsers(_, res) {
  try {
    const users = await User.find().exec();
    res.status(200).json(users);
  } catch (error) {
    res.json(error);
    console.log("GET ALL USERS ERROR");
    console.log(error);
  }
}

// return user's followers

async function userSubscriptions(req, res) {
  try {
    const id = req.params.id;
    const user = await User.findById(id).exec();

    const arrUsers = await Promise.all(
      user.following.map((userId) => User.findById(userId).exec())
    );

    return res.status(200).json(arrUsers);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

async function userFollowers(req, res) {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).exec();

    const followers = await Promise.all(
      user.followers.map((userId) => User.findById(userId).exec())
    );

    return res.status(200).json(followers);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  updateUser,
  deleteUser,
  getUser,
  isFollowing,
  followUser,
  unfollowUser,
  searchUsers,
  getAllUsers,
  userSubscriptions,
  searchAllUsers,
  userFollowers,
};
