const { Schema, model } = require("mongoose");

const NotificationsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messages: {
    type: Array,
    default: [],
    required: true,
  },
  variousNotifications: {
    type: Array,
    default: [],
    required: true,
  },
  follows: {
    type: Array,
    default: [],
    required: true,
  },
});

module.exports = model("Notifications", NotificationsSchema);
