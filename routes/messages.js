const router = require("express").Router();

const {
  createMessage,
  getMessages,
} = require("../controllers/messagesController");

router.post("/", createMessage);
router.post("/:conversationId", getMessages);

module.exports = router;
