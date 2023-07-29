const { Schema, model } = require("mongoose");

const BlockSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  blockingUsers: {
    type: Array,
    default: [],
    required: true,
  },
});

module.exports = model("Block", BlockSchema);
