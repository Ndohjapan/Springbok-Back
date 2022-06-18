const express = require("express");
const router = express.Router();
const {protect} = require("../controllers/authController");

const {getUtils, updateUtils,getAllHostels, getAllLevels} = require("../controllers/foodCollection/utilController");

// Get and update utils
router.route("/").get(protect, getUtils).put(protect, updateUtils);

router.route("/getAllLevels").get(getAllLevels)
router.route("/getAllHostels").get(getAllHostels)

module.exports = router;
