const express = require("express");

const router = express.Router();

const {
  resetStudentPin,
  resetStudentPassword,
  getTransactionsDetails,
  getUsersDetails,
  getDisbursementDetails,
  updateAdmins,
  deleteAdmins,
  getAllAdmins,
  unreadNotifications,
  allPermissions,
  createAdmin,
  exportCSV,
  endSession,
  approveTempoararyTransactions,
  exportTemporaryTransations,
  sendOtpToNewEmail,
  confirmOtpAndChangeEmail,
} = require("../controllers/foodCollection/feedingDashboardController");
const {
  permissionTo,
  onlyAdmins,
  adminAndRestaurants,
} = require("../controllers/authController");

router.route("/userDetails").get(onlyAdmins, getUsersDetails);

router.route("/transactionsDetails").get(onlyAdmins, getTransactionsDetails);

router.route("/disbursementDetails").get(onlyAdmins, getDisbursementDetails);

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
  .route("/sendOtpToNewEmail")
  .post(onlyAdmins, permissionTo("edit users"), sendOtpToNewEmail);
  
router
  .route("/confirmOtpAndChangeEmail")
  .post(onlyAdmins, permissionTo("edit users"), confirmOtpAndChangeEmail);

router.route("/getAllAdmins").get(getAllAdmins);

router
  .route("/deleteAdmins/:id")
  .delete(onlyAdmins, permissionTo("all"), deleteAdmins);

router
  .route("/updateAdmins/:id")
  .post(onlyAdmins, permissionTo("all"), updateAdmins);

router.route("/unreadNotifications").get(onlyAdmins, unreadNotifications);

router.route("/allPermissions").get(onlyAdmins, allPermissions);

router
  .route("/approveTempoararyTransactions")
  .post(onlyAdmins, permissionTo("all"), approveTempoararyTransactions);

router
  .route("/exportCSV")
  .post(adminAndRestaurants, permissionTo("export csv"), exportCSV);

router
  .route("/exportTempoararyTransationCSV")
  .post(
    adminAndRestaurants,
    permissionTo("export csv"),
    exportTemporaryTransations
  );

router.route("/endSession").post(onlyAdmins, endSession);

module.exports = router;
