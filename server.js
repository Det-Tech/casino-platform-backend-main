const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const users = require("./api/users");
// const chats = require("./api/chats");
const games = require("./api/games");
const admin = require("./api/admin");
const history = require("./api/history");

const blockchainHandle = require("./blockchainApis");
const cors = require("cors");
const app = express();
require("dotenv").config();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
const mongourl = require("./config/config").mongoURI;
mongoose
    .connect(mongourl, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Use Routes
app.use("/api/users", users);
// app.use("/api/chat", chats);
app.use("/api/games", games);
app.use("/api/admin", admin);
app.use("/api/history", history);

//blockchain Handle 
blockchainHandle();

app.use(express.static(__dirname + "/build"));
app.get('/*', function (req, res) {
	res.sendFile(__dirname + '/build/index.html', function (err) {
		if (err) {
			res.status(500).send(err)
		}
	})
})

const port = require("./config/config").port;
app.listen(port, () => console.log(`Server running on port ${port}`));
