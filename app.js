const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const globalErrorHandler = require("./controllers/errorController");
const {protect} = require("./controllers/authController")
const foodRoutes = require("./routes/foodRoutes")
const restaurantRoutes = require("./routes/restaurantRoutes")
const orderRoutes = require("./routes/orderRoutes")
const userRoutes = require("./routes/userRoutes")
const qrTransactions = require("./routes/qrTransaction/qrTreansaction")
const userFeedingRoutes = require("./routes/userFeedingRoutes")
const AppError = require("./utils/appError");

// routes
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") app.use(morgan("short"));

app.use("/api/v1/users", authRoutes);
app.use("/food", protect, foodRoutes)
app.use("/restaurant", protect, restaurantRoutes)
app.use("/order", protect, orderRoutes)
app.use("/feeding", protect, userFeedingRoutes)
app.use("/user", protect, userRoutes)
app.use("/qr", protect, qrTransactions)

app.all("*", (req, res, next) =>
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404))
);

app.use(globalErrorHandler);

module.exports = app;
