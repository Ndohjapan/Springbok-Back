const express = require("express");

const router = express.Router();

const {
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  postFilter,
  getAllUserData
} = require("../controllers/userController");
const { protect, permissionTo, onlyAdmins } = require("../controllers/authController");

// Get all from the collection
router.route("/").get(getAllUsers);

// Get by id
router.route("/:id").get(getUser);

// Get all users data
router.route("/all/:id").get(getAllUserData);

// Delete
router.route("/").delete(onlyAdmins, permissionTo("delete users"), deleteUser);

// Put
router.route("/:id").put(updateUser);

// User eith filter
router.route("/post/filter").post(postFilter);

module.exports = router;
