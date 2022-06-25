const express = require("express")

const router = express.Router()

const {checkBalance, confirmRestaurant, doTransfer, confirmPinandBalance, restaurantDoTransfer, validateTransaction} = require("../../controllers/foodCollection/qrTransaction/qrTransaction")

const {permissionTo, protect} = require("../../controllers/authController")


// Chcek Balance
router
    .route("/checkBalance")
    .get(permissionTo("user"), checkBalance)    

// Confirm Restaurant
router
    .route("/confirmRestaurant/:id")
    .get(permissionTo("user"), confirmRestaurant)

// do the transfer
router
    .route("/doTransfer")
    .post(permissionTo("user"), doTransfer)

router
    .route("/confirmPinAndBalance")
    .post(confirmPinandBalance)

// router
//     .route("/restaurantDoTransfer")
//     .post(restrictTo("restaurant"), restaurantDoTransfer)
router
    .route("/validateTransaction")
    .get(permissionTo("user"), validateTransaction)
    
module.exports = router