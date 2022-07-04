require("dotenv").config();
module.exports = {
    mongoURI: "mongodb://localhost:27017/db_casino",
    secretOrKey: process.env.TOKEN_SECRET,
    port: 80,
    cloudinary: {
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
    },
};
