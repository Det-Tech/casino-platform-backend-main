const { handleDeposits, handleStake } = require("./handler");
const { withdrawRequests } = require("./requests");
// const { syncPoolCache } = require("./game");

const blockchainHandle = async () => {
    handleDeposits();
    handleStake();
    withdrawRequests();
    // syncPoolCache();
};
module.exports = blockchainHandle;
