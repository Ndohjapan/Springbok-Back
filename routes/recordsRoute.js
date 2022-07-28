const express = require("express")

const router = express.Router()

const {getAllRecords, getRecord, deleteRecord, postFilter} = require("../controllers/foodCollection/recordsController")

const {permissionTo} = require("../controllers/authController")


// Get all from the collection
router
    .route("/")
    .get(getAllRecords)    


// Gt a users transactions
router
    .route("/:id")
    .get(getRecord)

// Delete
router
    .route("/:id")
    .delete(permissionTo("all"), deleteRecord)


// Transactions with filter
router
    .route("/post/filter")
    .post(postFilter)



module.exports = router
