const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const GameBasicSchema = new Schema({
    game_Id: {
        type: Number,
        required: true
    },
    owner: {
        type: String,
        required: true,
    },
    poolBalance: {
        type: Number,
        default: 0,
    },
    poolAddress: {
        type: String,
        required: true,
    },
    approve_flag: {
        type: Boolean,
        default: false,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    apiKey: {
        type: String
    }
});

const GameURISchecma = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    game_img_src: {
        type: String,
        required: true,
    },
    frontendurl: {
        type: String,
        required: true,
    },
    backendurl: {
        type: String,
    },
});

const GamesSchema = new Schema();
GamesSchema.add(GameBasicSchema).add(GameURISchecma);

const Game = mongoose.model("games", GamesSchema);
const ClosedGame = mongoose.model("closedgames", GamesSchema);

module.exports = { Game , ClosedGame};
