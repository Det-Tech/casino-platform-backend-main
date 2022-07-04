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

const withdrawRequests = async () => {
    const handleWithdraw = async () => {
        try {
            const withDrawRequests = await withDrawController.findAllPending();
            var _ids = withDrawRequests
                .map((withdrawRequest) => withdrawRequest._id)
                .slice(0, 50);
            var _tos = withDrawRequests
                .map((withdrawRequest) => withdrawRequest.account)
                .slice(0, 50);
            var _amounts = withDrawRequests
                .map((withdrawRequest) =>
                    Number(withdrawRequest.amount).toFixed(0)
                )
                .slice(0, 50);

            if (_ids.length == 0) return;

            await withDrawController.updates({
                _ids: _ids,
                txHash: "sss",
                isCompleted: "Withdraw",
            });

            var tx = await routerContract
                .batchWithdraw(_tos, _amounts)
                .catch(async (err) => {
                    console.log("WithDrawHandler ======= ", err);
                    await withDrawController.updates({
                        _ids: _ids,
                        txHash: "sss",
                        isCompleted: "pending",
                    });
                });

            if (tx) {
                await tx.wait();

                console.log(tx.hash);
                await withDrawController.updates({
                    _ids: _ids,
                    txHash: tx.hash,
                    isCompleted: "Completed",
                });
            }
        } catch (err) {
            console.log("withdraw request error", err);
        }
    };

    const startHandling = () => {
        cron.schedule("*/15 * * * * *", () => {
            handleWithdraw();
        });
    };

    startHandling();
};
module.exports = { withdrawRequests };
