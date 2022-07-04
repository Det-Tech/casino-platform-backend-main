/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const UserApproveSchema = new Schema({
	gamePoolAddress: {
		type: String,
	},
	amount: {
		type: Number,
		default: 0,
	},
});

const UserBasicSchema = new Schema({
	user_id: {
		type: Schema.Types.ObjectId,
	},
	account: {
		type: String,
		required: true,
	},
	date: {
		type: Date,
		default: Date.now,
	},
	balance: {
		type: Number,
		default: 0,
	},
	allowances: {
		type: [UserApproveSchema],
	},
});

const UserURISchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	avatar: {
		type: String,
	},
});

const UserSchema = new Schema();
UserSchema.add(UserBasicSchema).add(UserURISchema);

module.exports = User = mongoose.model("users", UserSchema);
