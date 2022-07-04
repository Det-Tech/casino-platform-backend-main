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
    withDrawController,
    poolCacheController,
} = require("../controllers/blockchain");

const syncPoolCache = async () => {
    const handleSync = async () => {
        try {
            var poolCaches = await poolCacheController.find();
            poolCaches = poolCaches.filter(
                (poolCache) => Number(poolCache.cacheBalance) != 0
            );
            var game_ids = poolCaches
                .map((poolCache) => poolCache.game_id)
                .slice(0, 50);
            var cacheBalances = poolCaches
                .map((poolCache) => Number(poolCache.cacheBalance))
                .slice(0, 50);
            var reserveBalance = cacheBalances.map(
                (cacheBalance) => -1 * cacheBalance
            );

            // game win - cachBalance < 0 (insight from pool balance)
            var winStates = cacheBalances.map(
                (cacheBalance) => cacheBalance < 0
            );
            var cacheAmount = cacheBalances.map((cacheBalance) =>
                Number(Math.abs(cacheBalance)).toFixed(0)
            );

            if (game_ids.length == 0) return;

            poolCacheController.updates({
                game_ids: game_ids,
                balanceChanges: reserveBalance,
            });

            var tx = await routerContract
                .batchGameUpdate(game_ids, cacheAmount, winStates)
                .catch((err) => {
                    console.log(err);
                    poolCacheController.updates({
                        game_ids: game_ids,
                        balanceChanges: cacheBalances,
                    });
                });
            console.log("ok");
            if (tx) {
                await tx.wait();
                console.log(tx.hash);
            } else {
                throw new Error("pool syncing error");
            }
        } catch (err) {
            console.log("pool syncing error", err);
        }
    };

    const startHandling = () => {
        cron.schedule("*/15 * * * * *", () => {
            console.log("running a pool syncing every 15 second");
            handleSync();
        });
    };

    startHandling();
};
module.exports = { syncPoolCache };
