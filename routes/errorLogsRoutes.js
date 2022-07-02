const express = require("express");

const router = express.Router();

const {postError, getAllErrors, updateError, getError, deleteError, postFilter} = require("../controllers/errorLogsController");


// Get all from the collection
router.route("/").get(getAllErrors);

// Get by id
router.route("/:id").get(getError);

// Delete
router.route("/:id").delete(deleteError);
 
// Put
router.route("/:id").put(updateError);

// User eith filter
router.route("/").post(postError);

// User eith filter
router.route("/post/filter").post(postFilter);


module.exports = router;