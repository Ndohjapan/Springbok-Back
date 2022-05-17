const express = require("express");
const router = express.Router();

const {
  postFood,
  getAllFoods,
  getFood,
  deleteFood,
  updateFood,
  postFilter,
} = require("../controllers/foodCollection/foodController");

// Create or Food into the document
router.route("/").get(getAllFoods).post(postFood);

// Handle Food By Id
router.route("/:id").get(getFood).delete(deleteFood).put(updateFood);

// Food eith filter
router.route("/post/filter").post(postFilter);

module.exports = router;
