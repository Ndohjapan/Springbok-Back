const express = require("express");
const router = express.Router();

const {deleteActivity, getActivity, getAllActivity} = require("../controllers/foodCollection/activityController");

// Activities all 
router
    .route("/")
    .get(getAllActivity)

// delete any
router
    .route("/:id")
    .delete(deleteActivity);

// Get a single activity 
router
    .route("/getActivity/:id")
    .get(getActivity)

module.exports = router;
