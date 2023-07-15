const router = require("express").Router();

const {
  createComment,
  getComment,
  getCommentReply,
} = require("../controllers/commentsController");

router.post("/", createComment);
router.post("/getComment", getComment);
router.post("/getCommentReply", getCommentReply);

module.exports = router;
