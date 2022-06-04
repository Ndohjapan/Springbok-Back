const express = require("express");
const router = express.Router();

const {getUtils, updateUtils} = require("../controllers/foodCollection/utilController");

// Get and update utils
router.route("/").get(getUtils).put(updateUtils);

module.exports = router;
