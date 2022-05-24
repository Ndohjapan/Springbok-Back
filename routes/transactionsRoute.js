const express = require("express")

const router = express.Router()

const {getAllTransactions, getTransaction, deleteTransaction, postFilter} = require("../controllers/foodCollection/transactionsController")

const {protect, restrictTo} = require("../controllers/authController")


// Get all from the collection
router
    .route("/")
    .get(protect, restrictTo("manager", "bursar", "user"), getAllTransactions)    

// Get by id
router
    .route("/:id")
    .get(getTransaction)

// Delete
router
    .route("/:id")
    .delete(protect, restrictTo("bursar"), deleteTransaction)


// Transactions with filter
router
    .route("/post/filter")
    .post(postFilter)



module.exports = router
