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
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION 📌");
});
