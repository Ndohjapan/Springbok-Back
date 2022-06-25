const mongoose = require("mongoose");

const mongoDbUrl = process.env.mongoDbUrl

module.exports = function connectDB() {
  mongoose
    .connect(mongoDbUrl)
    .then(() => console.log("Connected to db"))
    .catch((err) => console.log(err));
};
