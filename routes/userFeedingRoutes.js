const express = require("express");

const router = express.Router();

const {
  savePin,
  resetPin,
  deleteUser,
  updateUser,
  getAllUsers,
  getUser,
  postFilter,
  validateUsers,
  invalidateUsers,
  fundWallet,
  fundAllLegibleWallets,
  editTotalFunds,
  confirmPin,
  getUserTransactions
} = require("../controllers/foodCollection/userFeedingController");

const { permissionTo, onlyAdmins } = require("../controllers/authController");
const { adminSchema } = require("../models/mainModel");

// Save Users Transaction Pin
router.route("/").post(savePin);

// Get all from the collection
router.route("/").get(getAllUsers);

// Get by id
router.route("/:id").get(getUser);

// Update User Feeding Profile
router.route("/updateUser/:id").post(updateUser)

// Delete
router.route("/:id").delete(adminSchema, permissionTo("all"), deleteUser);

router.route("/confirmPin").post(confirmPin);

// Put
router.route("/resetPin").post(resetPin);

// User eith filter
router.route("/post/filter").post(postFilter);

// Validate Users
router
  .route("/validateUsers")
  .post(onlyAdmins, permissionTo("validate users"), validateUsers);

// Get a users transaction
router
  .route("/getUserTransactions")
  .post(onlyAdmins, permissionTo("validate users"), getUserTransactions);

// Validate Users
router
  .route("/invalidateUsers")
  .post(onlyAdmins, permissionTo("validate users"), invalidateUsers);

 // Edit users total feeding money
router
  .route("/editTotalFunds")
  .post(onlyAdmins, permissionTo("validate users"), editTotalFunds);

//Fund students wallet
router.route("/fundWallet").post(permissionTo("fund wallet"), fundWallet);

//Fund all legible students wallet
router.route("/fundAllLegibleWallets").post(onlyAdmins, permissionTo("fund wallet"), fundAllLegibleWallets);

module.exports = router;
