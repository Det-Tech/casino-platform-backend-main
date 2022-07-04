/** @format */

const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const ethers = require("ethers");

const { userMiddleware } = require("./middleware");

// Load User Controller
const { UserController } = require("../controllers/users");

// Load BlockChain Controller
const { withDrawController } = require("../controllers/blockchain");

router.post("/register", async (req, res) => {
    try {
        const { name, email, msg, signature } = req.body;
        const avatar = gravatar.url(req.body.account, {
            s: "200", // Size
            r: "pg", // Rating
            d: "mm", // Default
        });

        const account = await ethers.utils.verifyMessage(msg, signature);

        const newUserData = {
            email: email,
            name: name,
            avatar: avatar,
            account: account,
        }; // Create JWT Payload

        console.log("newUserData", newUserData);
        const result = await UserController.create(newUserData);

        var resDoc = result._doc;
        const token = jwt.sign(resDoc, config.secretOrKey, {
            expiresIn: "144h",
        });
        res.status(200).json({ status: true, token: token });
    } catch (err) {
        console.log(err);
        return res.json({ status: false, errors: err.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const actualAddress = await ethers.utils.verifyMessage(
            req.body.msg,
            req.body.signature
        );

        const result = await UserController.findWithAddress({ actualAddress });

        var resDoc = result._doc;

        const token = jwt.sign(resDoc, config.secretOrKey, {
            expiresIn: "144h",
        });

        res.status(200).json({ status: true, token: token });
    } catch (err) {
        console.log(err);
        return res.json({ status: false, errors: err.message });
    }
});

router.post("/savewithdrawamount", userMiddleware, async (req, res) => {
    try {
        const { withdrawAmount, signature } = req.body;

        const actualAddress = await ethers.utils.verifyMessage(
            "withdraw " + withdrawAmount,
            signature
        );

        // validator
        if (actualAddress !== req.user.account)
            throw new Error("Invalided Token");

        //user not found && balance Validator
        var result = await UserController.findWithAddress({
            actualAddress: actualAddress,
        });
        if (Number(result.balance) < Number(withdrawAmount)) {
            let error = new Error("inssuficient balance");
            throw error;
        }

        // update user Data request
        result = await UserController.updateBalance({
            account: actualAddress,
            amount: -1 * withdrawAmount,
        });

        var resDoc = result._doc;
        // save withdraw request
        await withDrawController.create({
            account: actualAddress,
            amount: withdrawAmount,
        });

        const token = jwt.sign(resDoc, config.secretOrKey, {
            expiresIn: "144h",
        });
        res.status(200).json({ status: true, token: token });
    } catch (err) {
        console.log(err);
        return res.json({
            status: false,
        });
    }
});

router.post("/approve", userMiddleware, async (req, res) => {
    try {
        const { approveAmount, poolAddress, signature } = req.body;

        const actualAddress = await ethers.utils.verifyMessage(
            "approve " + approveAmount + poolAddress,
            signature
        );

        // validator
        if (actualAddress !== req.user.account)
            throw new Error("Invalided Token");

        //user not found && balance Validator
        var result = await UserController.findWithAddress({
            actualAddress: actualAddress,
        });

        if (result.balance < approveAmount) {
            let error = new Error("inssuficient balance");
            throw error;
        }

        // update user Data request
        result = await UserController.updateAllowance({
            account: actualAddress,
            gamePoolAddress: poolAddress,
            amount: approveAmount,
        });

        var resDoc = result._doc;

        const token = jwt.sign(resDoc, config.secretOrKey, {
            expiresIn: "144h",
        });
        res.status(200).json({ status: true, token: token });
    } catch (err) {
        console.log(err);
        res.json({ status: false });
    }
});

router.post("/getUserData", userMiddleware, async (req, res) => {
    const { account } = req.user;
    const userData = await UserController.findWithAddress({
        actualAddress: account,
    });

    var resDoc = userData._doc;

    jwt.sign(
        resDoc,
        config.secretOrKey,
        { expiresIn: "144h" },
        (err, token) => {
            res.json({
                success: true,
                token: token,
            });
        }
    );
});

router.post("/getAllUsers", async (req, res) => {
    var result = await UserController.getAllUser(req.body);

    res.json({
        success: true,
        result: result,
    });
});
module.exports = router;
