const express = require("express")

const router = express.Router()

const {savePin, resetPin, deleteUser, getAllUsers, getUser, postFilter, validateUsers, fundWallet, transactions} = require("../controllers/foodCollection/userFeedingController")

const {protect, restrictTo} = require("../controllers/authController")

// Save Users Transaction Pin
router
    .route("/")
    .post(savePin)

// Get all from the collection
router
    .route("/")
    .get(protect, restrictTo("manager", "bursar", "user"), getAllUsers)    

// Get by id
router
    .route("/:id")
    .get(getUser)

// Get by id
router
    .route("/getTransactions")
    .get(protect, transactions)

// Delete
router
    .route("/:id")
    .delete(protect, restrictTo("bursar"), deleteUser)

// Put
router
    .route("/:id")
    .put(protect, restrictTo("bursar"), resetPin)


// User eith filter
router
    .route("/post/filter")
    .post(postFilter)


// Validate Users 
router.route("/validateUsers").post(validateUsers)


//Fund students wallet
router
    .route("/fundWallet").post(fundWallet)

module.exports = router
