/** @format */

const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { lookupPromise } = require("../utils");

const { UserController } = require("../controllers/users");
const { AdminController } = require("../controllers/admin");
const { GameController } = require("../controllers/games");

function userMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[0];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, config.secretOrKey, (err, user) => {
        console.log("Error: ", err);
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

const gameMiddleware = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[0];
    // const token = "ab6b07c077a831f6cf60615553943da7c07d282d";
    if (token == null) return res.sendStatus(401);
    var game = await GameController.findWithApiKey({ apiKey: token });
    if (!game) return res.sendStatus(404);
    req.game = game;
    next();
};

const onlyAdmin = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[0];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, config.secretOrKey, async (err, user) => {
        console.log("Error: ", err);
        if (err) return res.sendStatus(403);

        const admin = await AdminController.findAdmin(user);
        if (!admin) return res.sendStatus(403);

        next();
    });
};

module.exports = { userMiddleware, gameMiddleware, onlyAdmin };
