const express = require("express");

const router = express.Router();

const {resetStudentPin, resetStudentPassword, getTransactionsDetails, getUsersDetails, getDisbursementDetails, updateAdmins, deleteAdmins, getAllAdmins, unreadNotifications, allPermissions, createAdmin, exportCSV, endSession} = require("../controllers/foodCollection/feedingDashboardController");
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
    .route("/resetStudentPin")
    .post(permissionTo("all", "edit users"), resetStudentPin);

router
    .route("/resetStudentPassword")
    .post(permissionTo("all", "edit users"), resetStudentPassword);

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

router
    .route("/endSession")
    .post(endSession)

module.exports = router;
