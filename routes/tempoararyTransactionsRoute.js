const express = require("express")

const router = express.Router()

const {getAllTransactions, getTransaction, deleteTransaction, postFilter} = require("../controllers/foodCollection/tempoarayTransactionsController")

const {permissionTo, onlyAdmins, onlyRestauraants} = require("../controllers/authController")


// Get all from the collection
router
    .route("/")
    .get(permissionTo("validate users", "edit restaurant"), getAllTransactions)    

// Get by id
router
    .route("/:id")
    .get(permissionTo("validate users", "edit restaurant"), getTransaction)

// Delete
router
    .route("/:id")
    .delete(permissionTo("validate users", "edit restaurant"), deleteTransaction)


// Transactions with filter
router
    .route("/post/filter")
    .post(permissionTo("validate users", "edit restaurant"), postFilter)



module.exports = router
