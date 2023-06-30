const router = require("express").Router();

const {
  createPost,
  updatePost,
  deletePost,
  likePost,
  getPost,
  getUserPosts,
  getTimeline,
  getUserPosts2,
  getPostLikers,
} = require("../controllers/postsController");

router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
router.put("/:id/like", likePost);
router.get("/:id", getPost);
router.get("/user/:id", getUserPosts);
router.post("/user2", getUserPosts2);
router.get("/:id/all", getTimeline);
router.get("/:id/postLikers", getPostLikers);

module.exports = router;
