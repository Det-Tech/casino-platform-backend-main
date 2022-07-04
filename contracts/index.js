require("dotenv").config();
const { ethers } = require("ethers");

const Contrats = require("./contracts/26.json");

const supportChainId = 26;

const RPCS = {
    1: "http://13.59.118.124/eth",
    250: "https://rpc.ftm.tools/",
    4002: "https://rpc.testnet.fantom.network",
    26: "https://rpc.icicb.com",
    417: "https://testnet-rpc.icicbchain.org",
    1337: "http://localhost:7545",
    31337: "http://localhost:8545/",
};

const providers = {
    // 1: new ethers.providers.JsonRpcProvider(RPCS[1]),
    // 250: new ethers.providers.JsonRpcProvider(RPCS[250]),
    // 4002: new ethers.providers.JsonRpcProvider(RPCS[4002]),
    26: new ethers.providers.JsonRpcProvider(RPCS[26]),
    // 417: new ethers.providers.JsonRpcProvider(RPCS[417]),
    // 1337: new ethers.providers.JsonRpcProvider(RPCS[1337]),
    // 31337: new ethers.providers.JsonRpcProvider(RPCS[31337]),
};

const wallet = new ethers.Wallet(
    process.env.PRIVATEKEY,
    providers[supportChainId]
);

const routerContract = new ethers.Contract(
    Contrats.router.address,
    Contrats.router.abi,
    wallet
);
const atariContract = new ethers.Contract(
    Contrats.atari.address,
    Contrats.atari.abi,
    providers[supportChainId]
);

const treasuryContract = new ethers.Contract(
    Contrats.treasury.address,
    Contrats.treasury.abi,
    providers[supportChainId]
);

const stakingPoolAbi = Contrats.stakingPool.abi;

module.exports = {
    providers,
    routerContract,
    atariContract,
    treasuryContract,
    supportChainId,
    stakingPoolAbi,
};
