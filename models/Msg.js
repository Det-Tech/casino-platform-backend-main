const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const MsgSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Msg = mongoose.model("allmessages", MsgSchema);
