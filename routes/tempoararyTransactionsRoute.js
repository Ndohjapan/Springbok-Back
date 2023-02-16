const express = require("express")

const router = express.Router()

const {getAllTransactions, getTransaction, deleteTransaction, postFilter, restaurantInfo} = require("../controllers/foodCollection/tempoarayTransactionsController")

const {permissionTo, onlyAdmins, onlyRestauraants, adminAndRestaurants} = require("../controllers/authController")


// Get all from the collection
router
    .route("/")
    .get(adminAndRestaurants, getAllTransactions)    

// Get by id
router
    .route("/:id")
    .get(adminAndRestaurants, getTransaction)

// Delete
router
    .route("/:id")
    .delete(adminAndRestaurants, deleteTransaction)


// Transactions with filter
router
    .route("/post/filter")
    .post(adminAndRestaurants, postFilter)

// Restaurant details
router
    .route("/restaurantInfo")
    .post(onlyAdmins, restaurantInfo)



module.exports = router
