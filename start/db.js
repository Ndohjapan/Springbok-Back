const mongoose = require("mongoose");
const config = require("config");

const mongoDbUrl = config.get("mongoDbUrl");

module.exports = function connectDB() {
  mongoose
    .connect(mongoDbUrl)
    .then(() => console.log("Connected to db"))
    .catch((err) => console.log(err));
};
