const express = require("express")

const router = express.Router()

const {getAllRecords, getRecord, deleteRecord, postFilter} = require("../controllers/foodCollection/recordsController")

const {permissionTo, onlyAdmins} = require("../controllers/authController")


// Get all from the collection
router
    .route("/")
    .get(onlyAdmins, getAllRecords)    


// Gt a users transactions
router
    .route("/:id")
    .get(onlyAdmins, getRecord)

// Delete
router
    .route("/:id")
    .delete(onlyAdmins, permissionTo("all"), deleteRecord)


// Transactions with filter
router
    .route("/post/filter")
    .post(onlyAdmins, postFilter)



module.exports = router
