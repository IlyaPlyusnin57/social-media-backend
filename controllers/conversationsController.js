const Conversation = require("../models/Conversation");

// create a conversation

async function createConversation(req, res) {
  const convObj = {
    participants: [req.body.senderId, req.body.receiverId],
  };

  try {
    const doc = await Conversation.exists(convObj);

    if (doc) {
      res.status(403).json("Conversation already exists");
    } else {
      const savedConversation = await Conversation.create(convObj);
      res.status(200).json(savedConversation);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

// get conversation of a user

async function getConversation(req, res) {
  try {
    const convs = await Conversation.find({
      participants: { $in: [req.params.userId] },
    }).exec();
    res.status(200).json(convs);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

// get a conversation of two users

async function getConversations(req, res) {
  try {
    const conv = await Conversation.findOne({
      participants: { $all: [req.params.senderId, req.params.receiverId] },
    }).exec();
    res.status(200).json(conv);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

module.exports = { createConversation, getConversation, getConversations };
