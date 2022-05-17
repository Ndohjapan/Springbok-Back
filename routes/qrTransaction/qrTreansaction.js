const express = require("express")

const router = express.Router()

const {checkBalance, confirmRestaurant, doTransfer} = require("../../controllers/foodCollection/qrTransaction/qrTransaction")



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


module.exports = router