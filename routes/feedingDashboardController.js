const express = require("express");

const router = express.Router();

const {getTransactionsDetails, getUsersDetails, getDisbursementDetails, updateAdmins, deleteAdmins, getAllAdmins, unreadNotifications, allPermissions, createAdmin, exportCSV} = require("../controllers/foodCollection/feedingDashboardController");
const {permissionTo} = require("../controllers/authController")

router
    .route("/userDetails")
    .get(getUsersDetails);

router
    .route("/transactionsDetails")
    .get(getTransactionsDetails);

router
    .route("/disbursementDetails")
    .get(getDisbursementDetails);

router
    .route("/createAdmin")
    .post(permissionTo("all", "create admin"), createAdmin);

router
    .route("/getAllAdmins")
    .get(getAllAdmins);

router
    .route("/deleteAdmins/:id")
    .delete(permissionTo("all"), deleteAdmins);

router
    .route("/updateAdmins/:id")
    .post(permissionTo("all"), updateAdmins)

router
    .route("/unreadNotifications")
    .get(unreadNotifications)

router
    .route("/allPermissions")
    .get(allPermissions)

router
    .route("/exportCSV")
    .post(exportCSV)

module.exports = router;
