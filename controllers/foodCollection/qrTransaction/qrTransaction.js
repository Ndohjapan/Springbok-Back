const {restaurantSchema, transactionSchema, userFeedingSchema} = require("../../../models/mainModel")
const AppError = require("../../../utils/appError");
const catchAsync = require("../../../utils/catchAsync");
const ObjectId = require('mongoose').Types.ObjectId;

exports.checkBalance = catchAsync(async(req, res, next) => {
    let userId = req.user["_id"].toString()
    const result = await userFeedingSchema.findOne({userId: userId})

    res.status(200).send({status: true, balance: result.balance})
    
})

exports.confirmRestaurant = catchAsync(async(req, res, next) => {
    let restaurantId = req.params.id

    
    if(ObjectId.isValid(restaurantId)){
        if((String)(new ObjectId(restaurantId)) === restaurantId){
            const restaurant = await restaurantSchema.findById(restaurantId).select("-balance -previousBalance")
            if(restaurant.name){
                res.status(200).send({status: true, data: restaurant})
            }else{
                return next(new AppError("Invalid Restaurant ID", 400));
            }
        }
        return next(new AppError("Invalid Restaurant ID", 400));
    }else{
        return next(new AppError("Invalid Restaurant ID", 400));
    }


    
})

exports.doTransfer = catchAsync(async(req, res, next) => {
    let userId = req.user["_id"].toString()
    let {transactionPin, amount, restaurantId} = req.body

    amount = parseInt(amount)

    const user = await userFeedingSchema.findOne({userId: userId});
    const restaurant = await restaurantSchema.findById(restaurantId);

    let balance = parseInt(user.balance)

    let restaurantBalance = parseInt(restaurant.balance)

    const checkPin = await user.checkPin(transactionPin);

    if(!checkPin){
        return next(new AppError("Wrong Pin", 400));
    }
    else{
        if(balance < amount || amount < 1){
            return next(new AppError("Insufficient Funds", 400));
        }else{

            let userUpdate = await userFeedingSchema.findOneAndUpdate({userId: userId}, {$inc :{"balance": -(amount) }, $set:  {"previousBalance": balance}}, {new: true})
            let restaurantUpdate = await restaurantSchema.findByIdAndUpdate(restaurantId, {$inc :{"balance": amount }, $set: {"previousBalance": restaurantBalance}}, {new: true})

            let transaction = await transactionSchema.create({
                from: userId, to:restaurantId, amount: amount, restaurantPreviousBalance: restaurantBalance, restaurantCurrentBalance: (restaurantBalance + amount),
                studentPreviousBalance: balance, studentCurrentBalance: (userUpdate.balance)
            })


            transaction = await transactionSchema.findById(transaction["_id"].toString()).populate(["from", "to"]).select("-updatedAt")
            res.status(200).send({status: true, payload: transaction})
            


        }
    }
  
    // Check the pin
    // add money to restauant, remove money from student
    // create transaction document
    
})


exports.confirmPinandBalance = catchAsync(async(req, res, next) => {
    let userId = req.user["_id"].toString()
    let {transactionPin, amount} = req.body

    const user = await userFeedingSchema.findOne({userId: userId});

    let balance = user.balance
    
    const checkPin = await user.checkPin(transactionPin);
    if(!checkPin){
        return next(new AppError("Wrong Pin", 400));
    }
    else{
        if(await confirm(balance, amount)){
            return res.status(200).send({status: true, message: "Confirmation Successful"})
        }else{
            return next(new AppError("Insufficient Funds", 400));
        }
    }
})

exports.restaurantDoTransfer = catchAsync(async(req, res, next) => {
    let {userId, amount} = req.body
    let restaurantId = req.user["_id"].toString()

    const restaurant = await restaurantSchema.findOne({userId: restaurantId});
    const user = await userFeedingSchema.findOne({userId: userId}).populate(["userId"]);

    let balance = user.balance
    let restaurantBalance = restaurant.balance

    if(await confirm(balance, amount)){
        let userUpdate = userFeedingSchema.findOneAndUpdate({userId: userId}, {$inc :{"balance": -(amount) }, $set:  {"previousBalance": balance}})
        let restaurantUpdate = restaurantSchema.findByIdAndUpdate(restaurantId, {$inc :{"balance": amount }, $set: {"previousBalance": restaurantBalance}})
        let transaction = transactionSchema.create({
            from: userId, to:restaurantId, amount: amount, restaurantPreviousBalance: restaurantBalance, restaurantCurrentBalance: (restaurantBalance + amount),
            studentPreviousBalance: balance, studentCurrentBalance: (balance + amount)
        })

        let promises = [userUpdate, restaurantUpdate, transaction]

        Promise.all(promises).then(async(results) => {
            transaction = await transactionSchema.findById(results[2]["_id"].toString()).populate(["from", "to"]).select("-updatedAt")

            return res.status(200).send({status: true, payload: transaction})

        })
    }else{
        let message = `${user.userId.firstname} ${user.userId.lastname} has Insufficeint Balance`
        return next(new AppError(message, 400));
    }

})

exports.validateTransaction = catchAsync(async(req, res, next) => {
    return res.send({status: true})
})

async function confirm(balance, amount){
    if(balance < amount || amount < 1){
        return false;
    }else{
        return true
    }
}

