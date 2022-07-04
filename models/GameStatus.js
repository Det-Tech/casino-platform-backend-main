const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const GamestatusSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  account: {
    type: String,
    required: true,
  },
  game_id: {
    type: Schema.Types.ObjectId,
    ref: "games",
  },
  balance: {
    type: Number,
    default: 0,
  },
  alias_balance: {
    type: Number,
    default: 0,
  },
  game_win: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = GameStatus = mongoose.model("gamestatus", GamestatusSchema);
