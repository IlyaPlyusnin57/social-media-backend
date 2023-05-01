const router = require("express").Router();

const {
  updateUser,
  deleteUser,
  getUser,
  isFollowing,
  followUser,
  unfollowUser,
  searchUsers,
  getAllUsers,
  userFollowers,
} = require("../controllers/usersController");

router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/:id", getUser);
router.post("/:id/is-following", isFollowing);
router.patch("/:id/follow", followUser);
router.patch("/:id/unfollow", unfollowUser);
router.post("/search", searchUsers);
router.get("/:id/all", getAllUsers);
router.get("/:id/subscriptions", userFollowers);

module.exports = router;
