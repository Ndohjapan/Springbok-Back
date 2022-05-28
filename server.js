const app = require("./app");
const connectDb = require("./start/db");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION 📌, shutting down ...");
  process.exit(1);
});

// Connect to mongodb database
connectDb();

const PORT = process.env.PORT || 9002;
const server = app.listen(PORT, () =>
  console.log(`APP RUNNING ON PORT: ${PORT}`)
);

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION 📌");
});
