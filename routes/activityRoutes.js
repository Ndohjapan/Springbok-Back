const express = require("express");
const { onlyAdmins } = require("../controllers/authController");
const router = express.Router();

const {deleteActivity, getActivity, getAllActivity} = require("../controllers/foodCollection/activityController");

// Activities all 
router
    .route("/")
    .get(onlyAdmins, getAllActivity)

// delete any
router
    .route("/:id")
    .delete(onlyAdmins, deleteActivity);

// Get a single activity 
router
    .route("/getActivity/:id")
    .get(onlyAdmins, getActivity)

module.exports = router;
