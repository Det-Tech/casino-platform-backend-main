/** @format */

const { Game, ClosedGame } = require("../models/games/");

const { routerContract } = require("../contracts");

const GameController = {
	create: async (props) => {
		try {
			const {
				owner,
				name,
				description,
				frontendurl,
				backendurl,
				gameImageUrl,
				poolAddress,
			} = props;

			var gamename = await Game.findOne({
                name: name,
            });

            if (gamename) {
                return {
                    msg: "Already exist name",
                    success: false,
                };
            }
			
			var game = await Game.findOne({
				poolAddress: poolAddress,
			});

			if (game) {
				return {
					msg: "Invalid GameAddress ",
					success: false,
				};
			}

			var game_Id = await routerContract.gameIds(poolAddress);

			const newGame = new Game({
				owner: owner,
				name: name,
				description: description,
				frontendurl: frontendurl,
				backendurl: backendurl,
				game_img_src: gameImageUrl,
				poolAddress: poolAddress,
				game_Id: game_Id,
			});

			await newGame.save();

			var games = await Game.find(
				{},
				{
					_id: 0,
					owner: 1,
					poolBalance: 1,
					approve_flag: 1,
					date: 1,
					name: 1,
					description: 1,
					game_img_src: 1,
					frontendurl: 1,
					backendurl: 1,
					poolAddress: 1,
				}
			);

			return {
				success: true,
				games: games,
			};
		} catch (err) {
			console.log(err);
			return {
				success: false,
				msg: "Game Submit Failed",
			};
		}
	},

	/* ------------ game owner ------------- */
	update: async (props) => {
		const {
			owner,
			description,
			frontendurl,
			backendurl,
			poolAddress,
		} = props;

		var game = await Game.findOne({
			poolAddress: poolAddress,
		});

		if (!game || game.owner != owner) {
			return {
				msg: "Game Update Failed",
				success: false,
			};
		}

		game.description = description;
		game.frontendurl = frontendurl;
		game.backendurl = backendurl;

		await game.save();

		return game;
	},

	updateApiKey: async (props) => {
		const { apiKey, poolAddress, owner } = props;

		var game = await Game.findOne({
			poolAddress: poolAddress,
		});

		if (!game || game.owner != owner) {
			throw "Invalide update apikey request";
		}

		game.apiKey = apiKey;

		await game.save();

		return { apiKey: game.apiKey, poolAddress: game.poolAddress };
	},

	// secret search only owner
	findWithPoolAddress: async (props) => {
		const { poolAddress } = props;

		var game = await Game.findOne({
			poolAddress: poolAddress,
		});

		return game;
	},

	findWithApiKey: async (props) => {
		const { apiKey } = props;

		var game = await Game.findOne({
			apiKey: apiKey,
		});

		return game;
	},

	//normal
	find: async () => {
		var games = await Game.find(
			{},
			{
				_id: 0,
				owner: 1,
				poolBalance: 1,
				approve_flag: 1,
				date: 1,
				name: 1,
				description: 1,
				game_img_src: 1,
				frontendurl: 1,
				backendurl: 1,
				poolAddress: 1,
			}
		);
		return games;
	},

	/* ------------- platform admin action ------------- */
	approve: async (props) => {
		try {
			const { approve, poolAddress } = props;

			var game = await Game.findOne({
				poolAddress: poolAddress,
			});

			game.approve_flag = approve;

			await game.save();

			var games = await Game.find();
			return {
				success: true,
				games: games,
			};
		} catch (err) {
			return {
				success: false,
				msg: "approve failed",
			};
		}
	},

	delete: async (props) => {
		const { poolAddress } = props;

		var game = await Game.findOneAndRemove({
			poolAddress: poolAddress,
		});

		// await ClosedGameController.create(game);

		var games = await Game.find();
		return { games: games };
	},

	/* ------------- game action ------------- */

	updateBalance: async (props) => {
		const { addAmount, poolAddress } = props;

		var game = await Game.findOne({
			poolAddress: poolAddress,
		});

		game.poolBalance = Number(game.poolBalance) + Number(addAmount);
		if (game.poolBalance < 0) throw Error("Insuffiecnt pool poolBalance")
		await game.save();

		return game;
	},
};

const  ClosedGameController = {
	create: async (props) => {
		const {
			owner,
			name,
			description,
			frontendurl,
			backendurl,
			gameImageUrl,
			poolAddress,
		} = props;

		var game = await ClosedGame.findOne({
			poolAddress: poolAddress,
		});

		if (game) throw new Error("Exsit game Id");

		var game_Id = await routerContract.gameIds(poolAddress);

		const newGame = new ClosedGame({
			owner: owner,
			name: name,
			description: description,
			frontendurl: frontendurl,
			backendurl: backendurl,
			game_img_src: gameImageUrl,
			poolAddress: poolAddress,
			game_Id: game_Id,
		});

		await newGame.save();

		var games = await ClosedGame.find();

		return games;
	},

	updateBalance: async (props) => {
		const { newBalance, poolAddress } = props;

		var game = await ClosedGame.findOne({
			poolAddress: poolAddress,
		});

		if (!game) throw new Error("Invalid game Id");
		game.poolBalance = newBalance;

		game.save();

		var games = await ClosedGame.find();
		return {
			success: true,
			games: games,
		};
	},
};

module.exports = { GameController, ClosedGameController };
