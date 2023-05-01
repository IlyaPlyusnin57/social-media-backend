const router = require("express").Router();

const {
  createConversation,
  getConversation,
  getConversations,
} = require("../controllers/conversationsController");

router.post("/", createConversation);
router.get("/:userId", getConversation);
router.get("/:senderId/:receiverId", getConversations);

module.exports = router;
