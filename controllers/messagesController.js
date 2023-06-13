const Message = require("../models/Message");
const mongoose = require("mongoose");

const {
  updateNotifications,
} = require("../controllers/notificationsController");

// create a message

async function createMessage(req, res) {
  if (req.body.message === "")
    return res.status(403).json("Message cannot be empty!");

  try {
    const senderId = req.body.senderId;
    const conversationId = req.body.conversationId;
    const message = req.body.message;
    const receiverId = req.body.receiverId;

    const obj = await Message.create({
      senderId,
      conversationId,
      message,
    });

    updateNotifications(receiverId, { message: obj._doc });

    res.status(200).json(obj);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

// get all messages of a conversation

async function getMessages(req, res) {
  try {
    const lastPostId = req.body.lastPostId
      ? { _id: { $lt: new mongoose.Types.ObjectId(req.body.lastPostId) } }
      : {};

    const messages = await Message.find()
      .and([{ conversationId: req.params.conversationId }, lastPostId])
      .sort({ _id: -1 })
      .limit(10)
      .lean();

    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

module.exports = { createMessage, getMessages };
