const cron = require("node-cron");
const {
    providers,
    routerContract,
    atariContract,
    treasuryContract,
    supportChainId,
    stakingPoolAbi,
} = require("../contracts");

const {
    blockNumController,
    txHistoryController,
} = require("../controllers/blockchain");
const { UserController } = require("../controllers/users");
const { GameController } = require("../controllers/games");

const handleDeposits = () => {
    var chainId = supportChainId;
    var provider = providers[chainId];
    var latestblocknumber;

    const handletransactions = async () => {
        try {
            let blockNumber = await provider.getBlockNumber();
            console.log("fantomtenstnet : ", blockNumber, latestblocknumber);
            if (blockNumber > latestblocknumber) {
                var res = await treasuryContract.queryFilter(
                    "Deposit",
                    latestblocknumber + 1,
                    blockNumber
                );

                for (var index in res) {
                    var tx = res[index];
                    let account = tx.args.from;
                    let amount = tx.args.amount;
                    let hash = tx.transactionHash;
                    let blockNumber = tx.blockNumber;
                    console.log(
                        `Deposit require from ${account} amount ${amount} with hash ${hash} in block ${blockNumber}`
                    );

                    /*---------------- update userBalance ---------------*/
                    try {
                        await UserController.updateBalance({
                            account: account,
                            amount: amount,
                        });
                    } catch (err) {
                        console.log(
                            err.message
                                ? err.message
                                : "update user balance failed"
                        );
                    }

                    txHistoryController.create({
                        event: "Deposit",
                        contract: treasuryContract.address,
                        account: account,
                        amount: amount,
                    });
                }
            }
            latestblocknumber = blockNumber;

            await blockNumController.update({
                index: 0,
                latestBlock: blockNumber,
            });
        } catch (err) {
            console.log("err", err);
        }
    };

    const handleDeposits = async () => {
        var blockNumber;
        try {
            blockNumber = (await blockNumController.find({ index: 0 }))
                .latestBlock;
        } catch (err) {
            console.log(err);
        }
        if (!blockNumber) {
            blockNumber = await provider.getBlockNumber();
            await blockNumController.create({
                index: 0,
                latestBlock: blockNumber,
            });
        }

        latestblocknumber = blockNumber;
        cron.schedule("*/15 * * * * *", () => {
            handletransactions();
        });
    };

    handleDeposits();
};

const handleStake = () => {
    var chainId = supportChainId;
    var provider = providers[chainId];
    var latestblocknumber;

    const handletransactions = async () => {
        try {
            let blockNumber = await provider.getBlockNumber();
            console.log("fantomtenstnet : ", blockNumber, latestblocknumber);
            if (blockNumber > latestblocknumber) {
                var txhistory = atariContract.queryFilter(
                    "Transfer",
                    latestblocknumber + 1,
                    blockNumber
                );
                await txhistory.then(async (res) => {
                    for (var index in res) {
                        var tx = res[index];
                        let from = tx.args.from;
                        let to = tx.args.to;
                        let value = tx.args.value;
                        let hash = tx.transactionHash;
                        let blockNumber = tx.blockNumber;
                        console.log(
                            `Transfer require from ${from} to ${to} amount ${value} with hash ${hash} in block ${blockNumber}`
                        );

                        /*---------------- update userBalance ---------------*/
                        const games = await GameController.find();
                        var poolAddresses = games.map(
                            (game) => game.poolAddress
                        );

                        // stake(to == poolAddress) checking
                        var stakeIndex = poolAddresses.indexOf(to);
                        var unStakeIndex = poolAddresses.indexOf(from);
                        if (stakeIndex != -1) {
                            await GameController.updateBalance({
                                addAmount: value,
                                poolAddress: poolAddresses[stakeIndex],
                            });
                            txHistoryController.create({
                                event: "Stake",
                                contract: poolAddresses[stakeIndex],
                                account: from,
                                amount: value,
                            });
                        }
                        if (unStakeIndex != -1) {
                            await GameController.updateBalance({
                                addAmount: -1 * value,
                                poolAddress: poolAddresses[unStakeIndex],
                            });
                            txHistoryController.create({
                                event: "Stake",
                                contract: poolAddresses[unStakeIndex],
                                account: to,
                                amount: value,
                            });
                        }
                    }
                });
                latestblocknumber = blockNumber;

                await blockNumController.update({
                    index: 1,
                    latestBlock: blockNumber,
                });
            }
        } catch (err) {
            console.log("err", err);
        }
    };

    const handleStake = async () => {
        var blockNumber;
        try {
            blockNumber = (await blockNumController.find({ index: 1 }))
                .latestBlock;
        } catch (err) {
            console.log(err);
        }
        if (!blockNumber) {
            blockNumber = await provider.getBlockNumber();
            await blockNumController.create({
                index: 1,
                latestBlock: blockNumber,
            });
        }

        latestblocknumber = blockNumber;
        cron.schedule("*/15 * * * * *", () => {
            handletransactions();
        });
    };

    handleStake();
};

module.exports = { handleDeposits, handleStake };
