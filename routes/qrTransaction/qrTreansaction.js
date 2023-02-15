const express = require("express")

const router = express.Router()

const {checkBalance, confirmRestaurant, doTransfer, confirmPinandBalance, restaurantDoTransfer, validateTransaction} = require("../../controllers/foodCollection/qrTransaction/qrTransaction")

const {permissionTo, protect, onlyRestauraants} = require("../../controllers/authController")


// Chcek Balance
router
    .route("/checkBalance")
    .get(checkBalance)    

// Confirm Restaurant
router
    .route("/confirmRestaurant/:id")
    .get(confirmRestaurant)

// do the transfer
router
    .route("/doTransfer")
    .post(doTransfer)

router
    .route("/confirmPinAndBalance")
    .post(confirmPinandBalance)

router
    .route("/restaurantDoTransfer")
    .post(onlyRestauraants, restaurantDoTransfer)
router
    .route("/validateTransaction")
    .get(validateTransaction)
    
module.exports = router