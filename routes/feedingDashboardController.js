const express = require("express");

const router = express.Router();

const {getTransactionsDetails, getUsersDetails, getDisbursementDetails, updateSubAdmins} = require("../controllers/foodCollection/feedingDashboardController");
const {permissionTo} = require("../controllers/authController")

router
    .route("/userDetails")
    .get(permissionTo("all"), getUsersDetails);

router
    .route("/transactionsDetails")
    .get(permissionTo("all"), getTransactionsDetails);

router
    .route("/disbursementDetails")
    .get(permissionTo("all"), getDisbursementDetails);

router
    .route("/updateSubAdmins/:id")
    .put(permissionTo("all"), updateSubAdmins)

module.exports = router;
