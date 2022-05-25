const express = require("express")

const router = express.Router()

const {getAllTransactions, getTransaction, deleteTransaction, postFilter, getUserTransactions} = require("../controllers/foodCollection/transactionsController")

const {protect, restrictTo} = require("../controllers/authController")


// Get all from the collection
router
    .route("/all")
    .get(protect, restrictTo("manager", "bursar", "user"), getAllTransactions)    

// Get by id
router
    .route("/byId/:id")
    .get(protect, getTransaction)


// Gt a users transactions
router
    .route("/getUserTransactions")
    .get(getUserTransactions)

// Delete
router
    .route("/:id")
    .delete(protect, restrictTo("bursar"), deleteTransaction)


// Transactions with filter
router
    .route("/post/filter")
    .post(postFilter)



module.exports = router
