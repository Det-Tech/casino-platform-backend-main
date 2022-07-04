/** @format */

const {
	WithDrawOrders,
	PoolCaches,
	BlockNumber,
	TxHistorys,
} = require("../models/blockchain");

const withDrawController = {
	create: async (props) => {
		const { account, amount } = props;
		const withDrawOrder = new WithDrawOrders({
			account: account,
			amount: amount,
		});

		return await withDrawOrder.save();
	},
	update: async (props) => {
		const { _id, txHash, isCompleted } = props;
		var withDrawOrder = await WithDrawOrders.findOne({
			_id: _id,
		});

		withDrawOrder.isCompleted = isCompleted;
		withDrawOrder.txHash = txHash;
		await withDrawOrder.save();

		return withDrawOrder
	},
	updates: async (props) => {
		const { _ids, txHash, isCompleted } = props;
		var withDrawOrder = await WithDrawOrders.updateMany(
			{ _id: { $in: _ids }, },
			{ txHash: txHash, isCompleted: isCompleted }
		);

		return withDrawOrder;
	},
	findWithAddress: async (props) => {
		const { account } = props;
		var withDrawOrder = await WithDrawOrders.find({
			account: account,
			isCompleted: "pending",
		});

		return withDrawOrder
	},
	findWith_id: async (props) => {
		const { _id } = props;
		try {
			var withDrawOrder = await WithDrawOrders.findOne({
				_id: _id,
			});

			return {
				success: true,
				withDrawOrder: withDrawOrder,
			};
		} catch (err) {
			console.log(err);
			return {
				success: false,
			};
		}
	},
	findAllPending: async () => {
		var withDrawOrders = await WithDrawOrders.find({
			isCompleted: "pending",
		});
		return withDrawOrders;
	},
	findAll: async () => {
		var withDrawOrders = await WithDrawOrders.find();
		return withDrawOrders;
	},
};

const poolCacheController = {
	create: async (props) => {
		const { game_id, cacheBalance } = props;
		const poolCaches = new PoolCaches({
			game_id: game_id,
			cacheBalance: cacheBalance,
		});

		let order = await poolCaches.save();
		return order;
	},

	update: async (props) => {
		const { game_id, balanceChange } = props;
		var poolCaches = await PoolCaches.findOne({
			game_id: game_id,
		});

		console.log("cacheBalance update",balanceChange)
		poolCaches.cacheBalance =Number(poolCaches.cacheBalance) + Number(balanceChange);
		await poolCaches.save();

		return poolCaches;
	},

	updates: async (props) => {
		const { game_ids, balanceChanges } = props;
		game_ids.map(async(game_id, index)=>{
			var poolCaches = await PoolCaches.findOne({
				game_id: game_id,
			});
			poolCaches.cacheBalance += balanceChanges[index];
			await poolCaches.save();
		});
	},

	findWithGameId: async (props) => {
		const { game_id } = props;

		var poolCache = await PoolCaches.findOne({
			game_id: game_id,
		});

		return poolCache;
	},

	find: async () => {
		var poolCaches = await PoolCaches.find();
		return poolCaches;
	},
};

const blockNumController = {
	create: async (props) => {
		var { latestBlock, index } = props;
		const blockNumber = new BlockNumber({ index: index, latestBlock: latestBlock });
		var res = await blockNumber.save();
		return {
			index: res.index,
			latestBlock: res.latestBlock,
		};
	},
	update: async (props) => {
		var { latestBlock, index } = props;
		await BlockNumber.updateOne(
			{ index: index },
			{
				$set: { latestBlock: latestBlock },
				$currentDate: { lastModified: true },
			}
		);
		return true;
	},
	find: async (props) => {
		var { index } = props;
		var res = await BlockNumber.findOne({ index: index });
		return res;
	},
};

const txHistoryController = {
	create: async (props) => {
		try {
			var { event, contract, account, amount } = props;
			const txHistory = new TxHistorys({
				event: event,
				contract: contract,
				account: account,
				amount: Number(amount),
			});
			var res = await txHistory.save();
			return {
				success: true,
				txHistory: res,
			};
		} catch (err) {
			console.log(err);
			return {
				success: false,
			};
		}
	},
	findWithEvent: async (props) => {
		const { event } = props;
		try {
			const txs = await TxHistorys.find({
				event: event,
			});

			return {
				success: true,
				txs: txs,
			};
		} catch (err) {
			console.log(err);
			return {
				success: false,
			};
		}
	},
};

module.exports = {
	withDrawController,
	poolCacheController,
	blockNumController,
	txHistoryController,
};
