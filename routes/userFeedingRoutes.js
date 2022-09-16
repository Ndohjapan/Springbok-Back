const express = require("express");

const router = express.Router();

const {
  savePin,
  resetPin,
  deleteUser,
  getAllUsers,
  getUser,
  postFilter,
  validateUsers,
  invalidateUsers,
  fundWallet,
  fundAllLegibleWallets,
  confirmPin,
} = require("../controllers/foodCollection/userFeedingController");

const { permissionTo } = require("../controllers/authController");

// Save Users Transaction Pin
router.route("/").post(savePin);

// Get all from the collection
router.route("/").get(getAllUsers);

// Get by id
router.route("/:id").get(getUser);

// Delete
router.route("/:id").delete(permissionTo("all"), deleteUser);

router.route("/confirmPin").post(confirmPin);

// Put
router.route("/resetPin").post(resetPin);

// User eith filter
router.route("/post/filter").post(postFilter);

// Validate Users
router
  .route("/validateUsers")
  .post(permissionTo("validate users"), validateUsers);

// Validate Users
router
  .route("/invalidateUsers")
  .post(permissionTo("validate users", "invalidate users"), invalidateUsers);

//Fund students wallet
router.route("/fundWallet").post(permissionTo("fund wallet"), fundWallet);

//Fund all legible students wallet
router.route("/fundAllLegibleWallets").post(permissionTo("fund wallet"), fundAllLegibleWallets);

module.exports = router;
