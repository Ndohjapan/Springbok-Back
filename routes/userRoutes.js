const express = require("express");

const router = express.Router();

const {
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  postFilter
} = require("../controllers/userController");
const {protect, restrictTo} = require("../controllers/authController")



// Get all from the collection
router.route("/").get( restrictTo("bursar", "dev"), getAllUsers);

// Get by id
router.route("/:id").get(getUser);

// Delete
router.route("/:id").delete( restrictTo("bursar", "dev"), deleteUser);

// Put
router.route("/:id").put(restrictTo("bursar", "dev"), updateUser);

// User eith filter
router.route("/post/filter").post(postFilter);


module.exports = router;
