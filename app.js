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
const userRoutes = require("./routes/userRoutes")
const activityRoutes = require("./routes/activityRoutes")
const utilsRoutes = require("./routes/utilRoutes")
const transactionRoute = require("./routes/transactionsRoute")
const qrTransactions = require("./routes/qrTransaction/qrTreansaction")
const userFeedingRoutes = require("./routes/userFeedingRoutes")
const AppError = require("./utils/appError");


// routes
const authRoutes = require("./routes/authRoutes");

const app = express();

const corsOptions ={
  origin:'*', 
  credentials:true,            
  optionSuccessStatus:200
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") app.use(morgan("short"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" ); 

  return next()
});

app.use("/api/v1/users", authRoutes);
app.use("/food", protect, foodRoutes)
app.use("/transaction", protect, transactionRoute)
app.use("/restaurant", fundingStatus, protect, restaurantRoutes)
app.use("/order", protect, orderRoutes)
app.use("/dashboard", protect, dashboardRoutes)
app.use("/feeding", fundingStatus, protect, userFeedingRoutes)
app.use("/activity", fundingStatus, protect, activityRoutes)
app.use("/util", fundingStatus, protect, utilsRoutes)
app.use("/user", protect, userRoutes)
app.use("/qr", fundingStatus, protect, qrTransactions)

app.all("*", (req, res, next) =>
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404))
);

app.use(globalErrorHandler);

module.exports = app;
