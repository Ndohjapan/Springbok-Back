const express = require("express")

const router = express.Router()

const {getAllTransactions, getTransaction, deleteTransaction, postFilter, getUserTransactions} = require("../controllers/foodCollection/transactionsController")

const {permissionTo, onlyAdmins} = require("../controllers/authController")


// Get all from the collection
router
    .route("/all")
    .get(getAllTransactions)    

// Get by id
router
    .route("/byId/:id")
    .get(getTransaction)


// Gt a users transactions
router
    .route("/getUserTransactions")
    .get(getUserTransactions)

// Delete
router
    .route("/:id")
    .delete(onlyAdmins, permissionTo("all"), deleteTransaction)


// Transactions with filter
router
    .route("/post/filter")
    .post(postFilter)



module.exports = router
