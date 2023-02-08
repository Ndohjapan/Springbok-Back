const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const globalErrorHandler = require("./controllers/errorController");
const {fundingStatus} = require("./middleware/fundingStatus")
const {protect} = require("./controllers/authController")
const foodRoutes = require("./routes/foodRoutes")
const restaurantRoutes = require("./routes/restaurantRoutes")
const orderRoutes = require("./routes/orderRoutes")
const dashboardRoutes = require("./routes/feedingDashboardController")
const documentRoutes = require("./routes/document")
const userRoutes = require("./routes/userRoutes")
const activityRoutes = require("./routes/activityRoutes")
const utilsRoutes = require("./routes/utilRoutes")
const transactionRoute = require("./routes/transactionsRoute")
const recordRoute = require("./routes/recordsRoute")
const searchRoute = require("./routes/searchRoutes")
const errorLogsRoute = require("./routes/errorLogsRoutes")
const qrTransactions = require("./routes/qrTransaction/qrTreansaction")
const backupRoutes = require("./routes/backupRoutes")
const userFeedingRoutes = require("./routes/userFeedingRoutes")
const AppError = require("./utils/appError");
const {interceptorParam, bruteForce} = require("./middleware/interceptorParam")

const dotenv = require("dotenv")
const path = require("path")
dotenv.config({path: "./config/config.env"})

// routes
const authRoutes = require("./routes/authRoutes");

const app = express();

const corsOptions ={
  origin:'*', 
  credentials:true,            
  optionSuccessStatus:200
}

app.use(cors(corsOptions));
app.use(express.json());
if (process.env.NODE_ENV === "development") app.use(morgan("short"));
app.use(express.urlencoded({ extended: true }));

app.use(interceptorParam)

app.use("/api/v1/users", bruteForce.prevent, fundingStatus, authRoutes);
app.use("/document", documentRoutes);
app.use("/error", errorLogsRoute);
app.use("/food", protect, foodRoutes)
app.use("/transaction", protect, transactionRoute)
app.use("/record", protect, recordRoute)
app.use("/search", protect, searchRoute)
app.use("/restaurant", fundingStatus, protect, restaurantRoutes)
app.use("/order", protect, orderRoutes)
app.use("/dashboard", protect, dashboardRoutes)
app.use("/feeding", fundingStatus, protect, userFeedingRoutes)
app.use("/activity", fundingStatus, protect, activityRoutes)
app.use("/util", fundingStatus, utilsRoutes)
app.use("/backup", backupRoutes)
app.use("/user", protect, userRoutes)
app.use("/qr", fundingStatus, protect, qrTransactions)

app.all("*", (req, res, next) => {
  if(process.env.NODE_ENV === "production"){
    return next (new AppError(`Page does not exist`, 404))
  }
  return next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404))
});

app.use(globalErrorHandler);

module.exports = app;
