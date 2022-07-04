/** @format */

const express = require("express");
const router = express.Router();

// Controllers
// const { GameController } = require("../controllers/games");
const { HistoryController } = require("../controllers/history");

router.post("/getBetInfos", async (req, res) => {
    try {
        var result = await HistoryController.getBetHistory();

        res.status(200).json({
            success: true,
            result: result,
        });
    } catch (err) {
        console.log(err);
        res.json({
            error: err.message,
        });
    }
});

router.post("/getCashInfos", async (req, res) => {
    try {
        var result = await HistoryController.getCashHistory();

        res.status(200).json({
            success: true,
            result: result,
        });
    } catch (err) {
        console.log(err);
        res.json({
            error: err.message,
        });
    }
});

router.post("/getPlayerInfos", async (req, res) => {
    try {
        var result = await HistoryController.getPlayerInfo();

        res.status(200).json({
            success: true,
            result: result,
        });
    } catch (err) {
        res.json({
            success: false,
            error: err.message,
        });
    }
});
module.exports = router;
