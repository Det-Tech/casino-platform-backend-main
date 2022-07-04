/** @format */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");
var crypto = require("crypto");
const config = require("../config/config");

// Game Controller
const { GameController } = require("../controllers/games");

// Load User Controller
const { UserController } = require("../controllers/users");
const { poolCacheController } = require("../controllers/blockchain");

// History Controller
const { HistoryController } = require("../controllers/history");

// userMiddleware
const { userMiddleware, gameMiddleware } = require("./middleware");

cloudinary.config(config.cloudinary);

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "ataricasino",
        format: async (req, file) => "png", // supports promises as well
        public_id: (req, file) => req.body.name,
    },
});

const parser = multer({ storage: storage });

/* ------------ game Owner api ----------- */
/////////////////////////////////////////////

router.post(
    "/uploadfile",
    userMiddleware,
    parser.single("uploadfile"),
    async (req, res) => {
        const { name, description, frontendurl, backendurl, poolAddress } =
            req.body;
        const gameData = {
            owner: req.user.account,
            name: name,
            description: description,
            frontendurl: frontendurl,
            backendurl: backendurl,
            poolAddress: poolAddress,
            gameImageUrl: req.file.path,
        };

        const result = await GameController.create(gameData);

        if (result.success) {
            res.status(200).json({ success: true, games: result.games });
        } else {
            return res.status(200).json({ success: false, error: result.msg });
        }
    }
);

router.post("/getgameinfo", userMiddleware, async (req, res) => {
    try {
        const { poolAddress } = req.body;
        var game = await GameController.findWithPoolAddress(poolAddress);

        if (!game) throw new Error("Invalide game Id");
        if (game.owner !== req.user.account)
            throw new Error("You are not owner of Game");
        return game;
    } catch (err) {
        console.log(err);
        res.status(400).json({
            error: err.message,
        });
    }
});

router.post("/updateApiKey", userMiddleware, async (req, res) => {
    try {
        const { poolAddress } = req.body;
        var game = await GameController.findWithPoolAddress({ poolAddress });

        if (!game) throw new Error("Invalide game Id");
        if (game.owner !== req.user.account)
            throw new Error("You are not owner of Game");

        var newApiKey = crypto.randomBytes(20).toString("hex");
        var game = await GameController.updateApiKey({
            apiKey: newApiKey,
            poolAddress: poolAddress,
            owner: req.user.account,
        });
        res.status(200).json({
            status: true,
            key: newApiKey,
        });
    } catch (err) {
        console.log(err);
        res.json({
            status: false,
        });
    }
});

router.post("/updateGame", userMiddleware, async (req, res) => {
    try {
        const {
            poolAddress,
            description,
            frontendurl,
            backendurl,
            gameImageUrl,
        } = req.body;
        var game = await GameController.findWithPoolAddress({ poolAddress });

        if (!game) throw new Error("Invalide game Id");
        if (game.owner !== req.user.account)
            throw new Error("You are not owner of Game");

        await GameController.update({
            poolAddress,
            description,
            frontendurl,
            backendurl,
            gameImageUrl,
            owner: req.user.account,
        });

        var games = await GameController.find();
        res.status(200).json({
            status: true,
            games: games,
        });
    } catch (err) {
        console.log(err);
        res.json({
            status: error,
        });
    }
});

router.post("/deleteGame", userMiddleware, async (req, res) => {
    try {
        const { poolAddress } = req.body;
        var game = await GameController.findWithPoolAddress(poolAddress);

        if (!game) throw new Error("Invalide game Id");
        if (game.owner !== req.user.account)
            throw new Error("You are not owner of Game");

        return await GameController.delete({ poolAddress: poolAddress });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            error: err.message,
        });
    }
});

/* ------------ game api ----------- */
///////////////////////////////////////

router.post("/getgamelist", async (req, res) => {
    try {
        var games = await GameController.find();

        res.json({
            success: true,
            games: games,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            error: err.message,
        });
    }
});

router.post("/getAllGameInfos", async (req, res) => {
    const result = await HistoryController.getGameHistory();

    res.json({
        success: true,
        result: result,
    });
});

router.post("/getUserInfo,", gameMiddleware, async (req, res) => {
    try {
        const userDecoded = jwt_decode(req.body.token);
        var user = await UserController.findWithAddress(userDecoded.account);
        const gamePoolAddress = req.game.poolAddress;

        const apporveInfo = user.allowances.find(
            (allowance) => allowance.gamePoolAddress == gamePoolAddress
        );

        return apporveInfo;
    } catch (err) {
        console.log(err);
        res.status(400).json({
            error: err.message,
        });
    }
});

router.post("/bet", gameMiddleware, async (req, res) => {
    try {
        const { token, amount } = req.body;

        console.log("token: ", token, "\n", "amount: ", amount);

        const userDecoded = jwt_decode(token);
        const gamePoolAddress = req.game.poolAddress;

        //user data
        var user = await UserController.updateForGame({
            account: userDecoded.account,
            gamePoolAddress: gamePoolAddress,
            addamount: -1 * amount,
        });

        // game pool
        const game = await GameController.updateBalance({
            addAmount: amount,
            poolAddress: gamePoolAddress,
        });

        if (
            await poolCacheController.findWithGameId({ game_id: game.game_Id })
        ) {
            poolCacheController.update({
                game_id: game.game_Id,
                balanceChange: amount,
            });
        } else {
            poolCacheController.create({
                game_id: game.game_Id,
                cacheBalance: amount,
            });
        }

        await HistoryController.createBetHistory({
            gameID: game.game_Id,
            actor: userDecoded.account,
            name: userDecoded.name,
            gamePoolAddress: gamePoolAddress,
            amount: amount,
        });

        const userData = jwt.sign(user._doc, config.secretOrKey, {
            expiresIn: "144h",
        });

        res.status(200).json({
            token: userData,
            poolBalance: game.poolBalance,
        });
    } catch (err) {
        console.log("betError", err);
        res.status(400).json(err.message);
    }
});

router.post("/winlose", gameMiddleware, async (req, res) => {
    try {
        const { token, amount, winState } = req.body;

        console.log(
            "Token: ",
            token,
            "\n",
            "Amount: ",
            amount,
            "\n",
            "WinState: ",
            winState
        );

        //user data
        const userDecoded = jwt_decode(token);
        const gamePoolAddress = req.game.poolAddress;

        if (winState == true && amount > 0) {
            var user = await UserController.updateForGame({
                //user data
                account: userDecoded.account,
                gamePoolAddress: gamePoolAddress,
                addamount: amount,
            });

            // game pool
            const game = await GameController.updateBalance({
                addAmount: -1 * amount,
                poolAddress: gamePoolAddress,
            });

            if (poolCacheController.findWithGameId(game.game_Id)) {
                poolCacheController.update({
                    game_id: game.game_Id,
                    balanceChange: -1 * amount,
                });
            } else {
                poolCacheController.create({
                    game_id: game.game_Id,
                    balanceChange: -1 * amount,
                });
            }

            await HistoryController.createCashHistory({
                gameID: game.game_Id,
                name: userDecoded.name,
                actor: userDecoded.account,
                gamePoolAddress: gamePoolAddress,
                amount: amount,
            });

            const userData = jwt.sign(user._doc, config.secretOrKey, {
                expiresIn: "144h",
            });

            res.status(200).json({
                token: userData,
                poolBalance: game.poolBalance,
            });
        } else {
            var user = await UserController.findWithAddress({
                actualAddress: userDecoded.account,
            });

            const userData = jwt.sign(user._doc, config.secretOrKey, {
                expiresIn: "144h",
            });

            // game pool
            const game = await GameController.findWithPoolAddress({
                poolAddress: gamePoolAddress,
            });

            res.status(200).json({
                token: userData,
                poolBalance: game.poolBalance,
            });
        }
    } catch (err) {
        console.log("winlose Error", err);
        res.status(400).json({
            error: err.message,
        });
    }
});

module.exports = router;
