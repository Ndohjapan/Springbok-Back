const express = require("express");

const router = express.Router();

const {
  postRestaurant,
  getAllRestaurants,
  getRestaurant,
  deleteRestaurant,
  updateRestaurant,
  postFilter,restaurantTransactions, allTransactions
} = require("../controllers/foodCollection/restaurantController");
const {permissionTo} = require("../controllers/authController")

// Create or Restaurant into the document
router.route("/").post(permissionTo("edit restaurant"), postRestaurant);

// Get all from the collection
router.route("/").get(getAllRestaurants);

// Get by id
router.route("/:id").get(getRestaurant);

// Delete
router.route("/:id").delete(permissionTo("edit restaurant"), deleteRestaurant);

// Put
router.route("/:id").put(permissionTo("edit restaurant"), updateRestaurant);

// Restaurant with filter
router.route("/post/filter").post(postFilter);

// Restaurant transactions
router.route("/transactions").post(restaurantTransactions)

// All transactions
router.route("/allTransactions").post(allTransactions)

module.exports = router;
