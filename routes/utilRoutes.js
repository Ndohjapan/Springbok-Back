const express = require("express");
const router = express.Router();
const {protect, onlyAdmins} = require("../controllers/authController");

const {getUtils, updateUtils,getAllHostels, getAllLevels, getAllDepartmensts} = require("../controllers/foodCollection/utilController");

// Get and update utils
router.route("/").get(protect, onlyAdmins, getUtils).put(protect, onlyAdmins, updateUtils);

router.route("/getAllLevels").get(getAllLevels)
router.route("/getAllHostels").get(getAllHostels)
router.route("/getAllDepartments").get(getAllDepartmensts)

module.exports = router;
