const express = require("express")

const router = express.Router()

const {userSearch} = require("../controllers/foodCollection/searchController")

const {permissionTo} = require("../controllers/authController")


// Gt a users transactions
router
    .route("/users")
    .post(userSearch)

module.exports = router
