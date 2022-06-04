const express = require("express")

const router = express.Router()

const {savePin, resetPin, deleteUser, getAllUsers, getUser, postFilter, validateUsers, fundWallet} = require("../controllers/foodCollection/userFeedingController")

const {permissionTo} = require("../controllers/authController")

// Save Users Transaction Pin
router
    .route("/")
    .post(savePin)

// Get all from the collection
router
    .route("/")
    .get(permissionTo("edit users"), getAllUsers)    

// Get by id
router
    .route("/:id")
    .get(getUser)

// Delete
router
    .route("/:id")
    .delete(permissionTo("all"), deleteUser)

// Put
router
    .route("/:id")
    .put(resetPin)


// User eith filter
router
    .route("/post/filter")
    .post(postFilter)


// Validate Users 
router.route("/validateUsers").post(permissionTo("validate users"), validateUsers)


//Fund students wallet
router
    .route("/fundWallet").post(permissionTo("fund wallet"), fundWallet)

module.exports = router
