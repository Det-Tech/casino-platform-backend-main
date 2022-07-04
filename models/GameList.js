const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const GamelistSchema = new Schema({
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
});

module.exports = GameList = mongoose.model("gamelist", GamelistSchema);
