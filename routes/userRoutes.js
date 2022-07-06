const express = require("express");

const router = express.Router();

const {
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  postFilter,
} = require("../controllers/userController");
const { protect, permissionTo } = require("../controllers/authController");

// Get all from the collection
router.route("/").get(getAllUsers);

// Get by id
router.route("/:id").get(getUser);

// Delete
router.route("/").delete(permissionTo("delete users"), deleteUser);

// Put
router.route("/:id").put(updateUser);

// User eith filter
router.route("/post/filter").post(postFilter);

module.exports = router;
