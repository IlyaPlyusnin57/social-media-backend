const router = require("express").Router();

const {
  updateUser,
  deleteUser,
  getUser,
  getUser2,
  isFollowing,
  followUser,
  unfollowUser,
  searchUsers,
  getAllUsers,
  userSubscriptions,
  searchAllUsers,
  userFollowers,
} = require("../controllers/usersController");

router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/:id", getUser);
router.get("/byUsername/:username", getUser2);
router.post("/:id/is-following", isFollowing);
router.patch("/:id/follow", followUser);
router.patch("/:id/unfollow", unfollowUser);
router.post("/search", searchUsers);
router.post("/searchAllUsers", searchAllUsers);
router.get("/:id/all", getAllUsers);
router.get("/:id/subscriptions", userSubscriptions);
router.get("/:id/followers", userFollowers);

module.exports = router;
