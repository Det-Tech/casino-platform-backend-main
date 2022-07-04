const { BetHistory, CashHistory } = require("../models/admins/history");
const { Game } = require("../models/games/");

const HistoryController = {
    createBetHistory: async (props) => {
        const { gameID, name, actor, gamePoolAddress, amount } = props;

        console.log("gameID: ", gameID);

        const newHistory = new BetHistory({
            gameID: gameID,
            name: name,
            actor: actor,
            poolAddress: gamePoolAddress,
            betAmount: amount,
        });

        let resultData = await newHistory.save();
        if (!resultData) throw new Error("Database Error");

        return resultData;
    },
    createCashHistory: async (props) => {
        const { gameID, name, actor, gamePoolAddress, amount } = props;

        console.log("gameID: ", gameID);
        console.log(name);
        const newHistory = new CashHistory({
            gameID: gameID,
            name: name,
            actor: actor,
            poolAddress: gamePoolAddress,
            cashAmount: amount,
        });

        let resultData = await newHistory.save();
        if (!resultData) throw new Error("Database Error");

        return resultData;
    },
    getBetHistory: async () => {
        const allResultPromise = BetHistory.aggregate([
            {
                $group: {
                    _id: {},
                    betAmount: { $sum: "$betAmount" },
                },
            },
        ]);
        const hourResultPromise = BetHistory.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$actTime" },
                        month: { $month: "$actTime" },
                        day: { $dayOfMonth: "$actTime" },
                        hour: { $hour: "$actTime" },
                    },
                    betAmount: { $sum: "$betAmount" },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ]);
        const dayResultPromise = BetHistory.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$actTime" },
                        month: { $month: "$actTime" },
                        day: { $dayOfMonth: "$actTime" },
                    },
                    betAmount: { $sum: "$betAmount" },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ]);
        const monthResultPromise = BetHistory.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$actTime" },
                        month: { $month: "$actTime" },
                    },
                    betAmount: { $sum: "$betAmount" },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ]);
        const yearResultPromise = BetHistory.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$actTime" },
                    },
                    betAmount: { $sum: "$betAmount" },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ]);
        const result = await Promise.all([
            allResultPromise,
            hourResultPromise,
            dayResultPromise,
            monthResultPromise,
            yearResultPromise,
        ]);

        if (!result) throw new Error("Database Error");

        return result;
    },
    getCashHistory: async () => {
        const allResultPromise = CashHistory.aggregate([
            {
                $group: {
                    _id: {},
                    cashAmount: { $sum: "$cashAmount" },
                },
            },
        ]);
        const hourResultPromise = CashHistory.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$actTime" },
                        month: { $month: "$actTime" },
                        day: { $dayOfMonth: "$actTime" },
                        hour: { $hour: "$actTime" },
                    },
                    cashAmount: { $sum: "$cashAmount" },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ]);
        const dayResultPromise = CashHistory.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$actTime" },
                        month: { $month: "$actTime" },
                        day: { $dayOfMonth: "$actTime" },
                    },
                    cashAmount: { $sum: "$cashAmount" },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ]);
        const monthResultPromise = CashHistory.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$actTime" },
                        month: { $month: "$actTime" },
                    },
                    cashAmount: { $sum: "$cashAmount" },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ]);
        const yearResultPromise = CashHistory.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$actTime" },
                    },
                    cashAmount: { $sum: "$cashAmount" },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ]);
        const result = await Promise.all([
            allResultPromise,
            hourResultPromise,
            dayResultPromise,
            monthResultPromise,
            yearResultPromise,
        ]);

        if (!result) throw new Error("Database Error");

        return result;
    },
    getGameHistory: async () => {
        const gamePoolAddressListPromise = Game.find(
            {},
            { _id: 0, name: 1, poolAddress: 1 }
        );

        const gameBetResultPromise = BetHistory.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$actTime" },
                        month: { $month: "$actTime" },
                        day: { $dayOfMonth: "$actTime" },
                        hour: { $hour: "$actTime" },
                        poolAddress: "$poolAddress",
                    },
                    betAmount: { $sum: "$betAmount" },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ]);

        const gameCashResultPromise = CashHistory.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$actTime" },
                        month: { $month: "$actTime" },
                        day: { $dayOfMonth: "$actTime" },
                        hour: { $hour: "$actTime" },
                        poolAddress: "$poolAddress",
                    },
                    cashAmount: { $sum: "$cashAmount" },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ]);

        const result = await Promise.all([
            gamePoolAddressListPromise,
            gameBetResultPromise,
            gameCashResultPromise,
        ]);

        return result;
    },
    getPlayerInfo: async () => {
        const cashInfos = CashHistory.aggregate([
            {
                $group: {
                    _id: {
                        name: "$name",
                    },
                    cashAmount: { $sum: "$cashAmount" },
                },
            },
            {
                $sort: {
                    cashAmount: -1,
                },
            },
        ]);

        if (!cashInfos) throw new Error("Database Error");

        return cashInfos;
    },
};

module.exports = { HistoryController };
