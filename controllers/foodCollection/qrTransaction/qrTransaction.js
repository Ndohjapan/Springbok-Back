const {userFeedingSchema} = require("../../../models/userFeedingModel")
const {restaurantSchema, transactionSchema} = require("../../../models/restaurantModel")
const AppError = require("../../../utils/appError");
const catchAsync = require("../../../utils/catchAsync");

exports.checkBalance = catchAsync(async(req, res, next) => {
    let userId = req.user["_id"].toString()
    const result = await userFeedingSchema.findOne({userId: userId})

    res.status(200).send({status: true, balance: result.balance})
    
})

exports.confirmRestaurant = catchAsync(async(req, res, next) => {
    let restaurantId = req.params.id
    const restaurant = await restaurantSchema.findById(restaurantId).select("-balance -previousBalance")

    res.status(200).send({status: true, data: restaurant})
    
})

exports.doTransfer = catchAsync(async(req, res, next) => {
    let userId = req.user["_id"].toString()
    let {transactionPin, amount, restaurantId} = req.body

    const user = await userFeedingSchema.findOne({userId: userId});
    const restaurant = await restaurantSchema.findById(restaurantId);

    let balance = user.balance
    let restaurantBalnce = restaurant.balance

    const checkPin = await user.checkPin(transactionPin);

    if(!checkPin){
        return next(new AppError("Wrong Pin", 400));
    }
    else{
        if(balance < amount){
            return next(new AppError("Insufficient Funds", 400));
        }else{

            let userUpdate = userFeedingSchema.findOneAndUpdate({userId: userId}, {$inc :{"balance": -(amount) }, $set:  {"previousBalance": balance}})
            let restaurantUpdate = restaurantSchema.findByIdAndUpdate(restaurantId, {$inc :{"balance": amount }, $set: {"previousBalance": restaurantBalnce}})
            let transaction = transactionSchema.create({
                from: userId, to:restaurantId, amount: amount
            })

            let promises = [userUpdate, restaurantUpdate, transaction]

            Promise.all(promises).then(async(results) => {
                transaction = await transactionSchema.findById(results[2]["_id"].toString()).populate(["from", "to"]).select("-updatedAt")

                res.status(200).send({status: true, payload: transaction})

            })


        }
    }
  
    // Check the pin
    // add money to restauant, remove money from student
    // create transaction document
    
})