const router = require("express").Router();

const {
  createComment,
  getComment,
  getCommentReply,
  editComment,
  deleteComment,
} = require("../controllers/commentsController");

router.post("/", createComment);
router.post("/getComment", getComment);
router.post("/getCommentReply", getCommentReply);
router.post("/edit", editComment);
router.delete("/:id", deleteComment);

module.exports = router;
