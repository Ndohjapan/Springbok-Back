const app = require("./app");
const connectDb = require("./start/db");
const socketio = require("socket.io")

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

const io = socketio(server)

io.on("connection", (socket) => {
  app.set("socket", socket);
});

process.on("unhandledRejection", (err) => {
  console.error("\nErrorHandler-StartRecord----------------------------------------------------")
  console.error("ErrorHandler-Error Time   : ", new Date().toLocaleString())
  console.error("ErrorHandler-Error API    : ", req.originalUrl)
  console.error("ErrorHandler-Error Name   : ", err.name)
  console.error("ErrorHandler-Error Msg    : ", err.message)
});
