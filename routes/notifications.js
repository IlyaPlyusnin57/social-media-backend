const router = require("express").Router();

const {
  removeNotification,
  getNotifications,
} = require("../controllers/notificationsController");

router.patch("/:userId", removeNotification);
router.get("/:userId", getNotifications);

module.exports = router;
