const express = require("express")

const router = express.Router()

const {userSearch, validatedUserSearch} = require("../controllers/foodCollection/searchController")

const {permissionTo, onlyAdmins, adminAndRestaurants} = require("../controllers/authController")


// Gt a users transactions
router
    .route("/users")
    .post(onlyAdmins, userSearch)

// Get validated users
router
    .route("/validatedUsers")
    .post(adminAndRestaurants, validatedUserSearch)

module.exports = router
