const router = require("express").Router();

const {
  removeNotification,
  getNotifications,
  updateNotifications,
} = require("../controllers/notificationsController");

router.patch("/update/:userId", updateNotifications);
router.patch("/:userId", removeNotification);
router.get("/:userId", getNotifications);

module.exports = router;
