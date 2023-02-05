const express = require("express")

const router = express.Router()

const {userSearch} = require("../controllers/foodCollection/searchController")

const {permissionTo, onlyAdmins} = require("../controllers/authController")


// Gt a users transactions
router
    .route("/users")
    .post(onlyAdmins, userSearch)

module.exports = router
