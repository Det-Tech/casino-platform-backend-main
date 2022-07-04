const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const withDrawOrders = new Schema({
	order_id: {
		type: Schema.Types.ObjectId,
	},
	account: {
		type: String,
		required: true,
	},
	amount: {
		type: Number,
		default: 0,
	},
	isCompleted: {
		type: String,
		default: "pending",
	},
	txHash: {
		type: String
	},
});

const poolCaches = new Schema({
	game_id: {
		type: Number,
	},
	cacheBalance: {
		type: Number
	}
})

const blockNumber = new Schema(
	{
		index:Number,
		latestBlock: Number
	}, { timestamps: true }
)

const txHistory = new Schema(
	{
		event: String,
		contract: String,
		account: String,
		amount: String
	}, { timestamps: true }
)

const WithDrawOrders = mongoose.model("withDrawOrders", withDrawOrders);
const PoolCaches = mongoose.model("poolCaches", poolCaches);

const BlockNumber = mongoose.model("blockNum", blockNumber);
const TxHistorys = mongoose.model("txHistorys", txHistory);

module.exports = { WithDrawOrders, PoolCaches, BlockNumber, TxHistorys };
