const express = require("express");
const router = express.Router();

// Load User model
const Msg = require("../models/Msg");

// @route   POST api/chats/save
// @desc    Save message content
// @access  Public
router.post("/save", (req, res) => {
  const newMsg = new Msg({
    user_id: req.body.id,
    name: req.body.name,
    email: req.body.email,
    content: req.body.content,
  });

  newMsg
    .save()
    .then(() => {
      Msg.find()
        .sort({ date: -1 })
        .limit(50)
        .then((msgs) => {
          res.json(msgs);
        });
    })
    .catch((err) => {
      return res.status(400).json(err);
    });
});

// @route   GET api/chats/getdata
// @desc    Get all message contents
// @access  Public
router.get("/getdata", (req, res) => {
  Msg.find()
    .sort({ date: -1 })
    .limit(50)
    .then((msgs) => {
      res.json(msgs);
    })
    .catch((err) => {
      return res.status(400).json(err);
    });
});

module.exports = router;
