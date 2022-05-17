const express = require("express");

const router = express.Router();

const {
  postOrder,
  getAllOrders,
  getOrder,
  deleteOrder,
  updateOrder,
  postFilter,
} = require("../controllers/foodCollection/orderController");

// Create or Order into the document
router.route("/").post(postOrder);

// Get all from the collection
router.route("/").get(getAllOrders);

// Get by id
router.route("/:id").get(getOrder);

// Delete
router.route("/:id").delete(deleteOrder);

// Put
router.route("/:id").put(updateOrder);

// Order eith filter
router.route("/post/filter").post(postFilter);

module.exports = router;
