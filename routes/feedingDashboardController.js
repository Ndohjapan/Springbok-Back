const express = require("express");

const router = express.Router();

const {getTransactionsDetails, getUsersDetails, getDisbursementDetails} = require("../controllers/foodCollection/feedingDashboardController");

router
    .route("/userDetails")
    .get(getUsersDetails);

router
    .route("/transactionsDetails")
    .get(getTransactionsDetails);

router
    .route("/disbursementDetails")
    .get(getDisbursementDetails);

module.exports = router;
