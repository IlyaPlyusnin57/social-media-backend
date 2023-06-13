const Notifications = require("../models/Notifications");
const User = require("../models/User");
const mongoose = require("mongoose");

async function getNotifications(req, res) {
  try {
    const userId = req.params.userId;
    const notifications = await Notifications.findOne({ userId });

    res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
  }
}

//Update notificaiton (create if not created)

async function updateNotifications(userId, newNotification) {
  let message = newNotification?.message;
  const follow = newNotification?.follow;
  const various = newNotification?.various;

  try {
    let notifications = await Notifications.findOne({ userId });

    if (!notifications) {
      notifications = await Notifications.create({ userId });
    }

    if (message) {
      const user = await User.findById(message.senderId);
      message["senderName"] = `${user.first_name} ${user.last_name}`;
      notifications.messages = [...notifications.messages, message];
    }

    if (follow) {
      notifications.follows = [...notifications.follows, follow];
    }

    if (various) {
      notifications.variousNotifications = [
        ...notifications.variousNotifications,
        various,
      ];
    }

    await notifications.save();
  } catch (error) {
    console.log(error);
  }
}

async function deleteNotificationsObject(userId) {
  const notifications = await Notifications.findOne({ userId });

  const isObjectEmpty =
    notifications.messages.length === 0 &&
    notifications.variousNotifications.length === 0 &&
    notifications.follows.length === 0;

  if (isObjectEmpty) {
    await Notifications.deleteOne({ userId });
  }
}

async function removeNotification(req, res) {
  try {
    const messageId = req.body?.messageId;
    const followId = req.body?.followId;
    const variousId = req.body?.variousId;

    const userId = req.params.userId;

    if (messageId) {
      await Notifications.updateOne(
        { userId },
        {
          $pull: {
            messages: { _id: new mongoose.Types.ObjectId(messageId) },
          },
        }
      );
    } else if (followId) {
      await Notifications.updateOne(
        { userId },
        {
          $pull: {
            follows: { id: followId },
          },
        }
      );
    }

    await deleteNotificationsObject(userId); // delete the object if it's empty

    return res.status(200).json("Notification Removed!");
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

module.exports = { updateNotifications, removeNotification, getNotifications };
