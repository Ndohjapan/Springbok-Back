const app = require("./app");
const connectDb = require("./start/db");
const socketio = require("socket.io")

const dotenv = require("dotenv")
dotenv.config({path: "./config/config.env"})

process.on("uncaughtException", (err) => {
  console.error("\nErrorHandler-StartRecord----------------------------------------------------")
  console.error("ErrorHandler-Error Time   : ", new Date().toLocaleString())
  console.error("ErrorHandler-Error Name   : ", err.name)
  console.error("ErrorHandler-Error Msg    : ", err.message)
});

// Connect to mongodb database
connectDb();

const PORT = process.env.PORT || 9002;
const server = app.listen(PORT, () =>
  console.log(`${process.env.NODE_ENV} APP RUNNING ON PORT: ${PORT}`)
);

const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PURGE"]
  }
})

io.on("connection", async(socket) => { 
  console.log("I have connected ", socket.id, socket.handshake.headers.restaurant)
  socket.io = io
  if(socket.handshake.headers.restaurant){
    socket.join(socket.handshake.headers.restaurant)
  }
  else{
    socket.join("admin")
  }
  app.set("socket", socket);

  socket.on("disconnect", async() => {
    console.log("I have disconnected ", socket.id)
  })
});

process.on("unhandledRejection", (err) => {
  console.error("\nErrorHandler-StartRecord----------------------------------------------------")
  console.error("ErrorHandler-Error Time   : ", new Date().toLocaleString())
  console.error("ErrorHandler-Error Name   : ", err.name)
  console.error("ErrorHandler-Error Msg    : ", err.message)
});
