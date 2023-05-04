const Message = require("../models/Message");
const aes256 = require("aes256");
const mongoose = require("mongoose");

const key = process.env.MESSAGE_SECRET;

// create a message

async function createMessage(req, res) {
  if (req.body.message === "")
    return res.status(403).json("Message cannot be empty!");

  try {
    const senderId = req.body.senderId;
    const conversationId = req.body.conversationId;
    const message = aes256.encrypt(key, req.body.message);

    const obj = await Message.create({
      senderId,
      conversationId,
      message,
    });

    obj.message = req.body.message;

    res.status(200).json(obj);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

// get all messages of a conversation

async function getMessages(req, res) {
  try {
    console.log({ body: req.body });
    const lastPostId = req.body.lastPostId
      ? { _id: { $lt: new mongoose.Types.ObjectId(req.body.lastPostId) } }
      : {};

    const messageArr = await Message.find()
      .and([{ conversationId: req.params.conversationId }, lastPostId])
      .sort({ _id: -1 })
      .limit(10)
      .lean();

    const messages = messageArr.map((obj) => {
      const message = aes256.decrypt(key, obj.message);
      return { ...obj, message };
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

module.exports = { createMessage, getMessages };
