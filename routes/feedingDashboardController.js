const express = require("express");

const router = express.Router();

const {getTransactionsDetails, getUsersDetails, getDisbursementDetails, updateAdmins, deleteAdmins, getAllAdmins, unreadNotifications} = require("../controllers/foodCollection/feedingDashboardController");
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
    .route("/getAllAdmins")
    .get(permissionTo("all"), getAllAdmins);

router
    .route("/deleteAdmins/:id")
    .delete(permissionTo("all"), deleteAdmins);

router
    .route("/updateAdmins/:id")
    .put(permissionTo("all"), updateAdmins)

router
    .route("/unreadNotifications")
    .get(unreadNotifications)

module.exports = router;
