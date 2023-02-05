const express = require("express");

const router = express.Router();

const {resetStudentPin, resetStudentPassword, getTransactionsDetails, getUsersDetails, getDisbursementDetails, updateAdmins, deleteAdmins, getAllAdmins, unreadNotifications, allPermissions, createAdmin, exportCSV, endSession} = require("../controllers/foodCollection/feedingDashboardController");
const {permissionTo, onlyAdmins} = require("../controllers/authController")

router
    .route("/userDetails")
    .get(onlyAdmins, getUsersDetails);

router
    .route("/transactionsDetails")
    .get(onlyAdmins, getTransactionsDetails);

router
    .route("/disbursementDetails")
    .get(onlyAdmins, getDisbursementDetails);

router
    .route("/createAdmin")
    .post(onlyAdmins, permissionTo("all", "create admin"), createAdmin);

router
    .route("/resetStudentPin")
    .post(onlyAdmins, permissionTo("edit users"), resetStudentPin);

router
    .route("/resetStudentPassword")
    .post(onlyAdmins, permissionTo("edit users"), resetStudentPassword);

router
    .route("/getAllAdmins")
    .get(getAllAdmins);

router
    .route("/deleteAdmins/:id")
    .delete(onlyAdmins, permissionTo("all"), deleteAdmins);

router
    .route("/updateAdmins/:id")
    .post(onlyAdmins, permissionTo("all"), updateAdmins)

router
    .route("/unreadNotifications")
    .get(onlyAdmins, unreadNotifications)

router
    .route("/allPermissions")
    .get(onlyAdmins, allPermissions)

router
    .route("/exportCSV")
    .post(onlyAdmins, permissionTo("export csv"), exportCSV)

router
    .route("/endSession")
    .post(onlyAdmins, endSession)

module.exports = router;
