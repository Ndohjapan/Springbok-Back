const app = require("./app");
const connectDb = require("./start/db");
const socketio = require("socket.io")
const {socketSchema} = require("./models/mainModel")

const dotenv = require("dotenv")
const path = require("path")
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
  console.log(`APP RUNNING ON PORT: ${PORT}`)
);

const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PURGE"]
  }
})

io.on("connection", async(socket) => {
  console.log(socket.id, "I Have Connected")
  
  if(socket.handshake.headers.restuarant){
    socket.join(socket.handshake.headers.restuarant)
  }
  else{
    socket.join("admin")
  }

  console.log(socket.adapter.rooms)

  await socketSchema.create({
    socketId: socket.id
  })

  app.set("socket", socket);

  socket.on("disconnect", async() => {
    console.log("I have disconnected ", socket.id)
    await socketSchema.deleteOne({socketId: socket.id})
  })
});

process.on("unhandledRejection", (err) => {
  console.error("\nErrorHandler-StartRecord----------------------------------------------------")
  console.error("ErrorHandler-Error Time   : ", new Date().toLocaleString())
  console.error("ErrorHandler-Error Name   : ", err.name)
  console.error("ErrorHandler-Error Msg    : ", err.message)
});
