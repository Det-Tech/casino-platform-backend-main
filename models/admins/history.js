const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Bet history
const betHistory = new Schema({
    betID: { type: Schema.Types.ObjectId },
    gameID: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        default: "",
    },
    actor: {
        type: String,
        default: "",
    },
    poolAddress: {
        type: String,
        required: true,
    },
    betAmount: {
        type: Number,
        default: 0,
    },
    actTime: {
        type: Date,
        default: Date.now,
    },
});

const cashHistory = new Schema({
    cashID: {
        type: Schema.Types.ObjectId,
    },
    gameID: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        default: "",
    },
    actor: {
        type: String,
        required: true,
    },
    poolAddress: {
        type: String,
        required: true,
    },
    cashAmount: {
        type: Number,
        default: 0,
    },
    actTime: {
        type: Date,
        default: Date.now,
    },
});

const BetHistory = mongoose.model("bethistory", betHistory);
const CashHistory = mongoose.model("cashhistory", cashHistory);

module.exports = { BetHistory, CashHistory };
