const {userFeedingSchema, disbursementSchema} = require("../../models/userFeedingModel")
const {restaurantSchema, transactionSchema} = require("../../models/restaurantModel")
const User = require("../../models/UserModel")
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const bcrypt = require("bcrypt")

exports.savePin = catchAsync(async(req, res, next) => {
    let {transactionPin} = req.body
    let userId = req.user["_id"]
    transactionPin = bcrypt.hashSync(transactionPin, 10)

    const user = await userFeedingModel.create({
      userId, transactionPin  
    })

    res.status(201).send({status: true, message: "User Created", data: user})
})

exports.getAllUsers = catchAsync(async(req, res, next) => {

    let page = req.query.page ? req.query.page : 1
    let limit = req.query.limit ? req.query.limit : 50

    const options = {
        page: page,
        limit: limit,
        sort: {"createdAt": -1},
        populate: ["userId"]
    };

    userFeedingSchema.paginate({}, options, function(err, result) {
        if(err){
            console.log(err)
            res.status(400).send(err)
        }else{
            res.status(200).send({status: true, message: "Successful", payload: result.docs})
        }
    })
})

exports.getUser = catchAsync(async(req, res, next) => {
    const user = await userFeedingSchema.findOne({userId: req.params.id})

    res.status(200).send({status: true, message: "Successful", data: user})
})

exports.resetPin = catchAsync(async(req, res, next) => {
    let data = req.body
    data.transactionPin = bcrypt.hashSync(data.transactionPin, 10)
    let updateData = {}

    Object.entries(data).forEach(([key, value]) => {
        if(value != ""){
            updateData[key] = value
        }
    })

    let user = await userFeedingSchema.findOneAndUpdate({userId: req.params.id}, updateData, {new: true})

    res.status(200).send({status: true, message: "User Updated", data: user})
})

exports.deleteUser = catchAsync(async(req, res, next) => {
    const user = await userFeedingSchema.findOneAndDelete({userId: req.params.id})

    res.status(200).send({status: true, message: "User Deleted"})
})


exports.postFilter = catchAsync(async(req, res, next) => {
    let data = req.body
    let updateData = {}

    Object.entries(data).forEach(([key, value]) => {
        if(value != ""){
            updateData[key] = value
        }
    })

    let user = await userFeedingSchema.find(updateData)

    res.status(200).send({status: true, message: "Successful", data: user})
})

exports.validateUsers = catchAsync(async(req,res, next) => {
    let {userIds, feedingType, studentStatus} = req.body
    try{
        let userUpdate = User.updateMany({$in: {"_id": userIds}}, {$set: {studentStatus: studentStatus}})
        let feedingUpdate = userFeedingSchema.updateMany({$in: {userId: userIds}}, {$set: {feedingType: feedingType, studentStatus: studentStatus}})
    
        let promises = [userUpdate, feedingUpdate]
    
        Promise.all(promises).then(results => {
            res.status(200).send({status: true, message:"Update Successful"})
        })
    }
    catch(err){
        console.log(err)
        return next(new AppError("Error in Update", 400));
    }

}) 

exports.fundWallet = catchAsync(async(req, res, next) => {
    let {userIds} = req.body

    try{

        let todaysDate = new Date().toISOString()
    
        let user = await userFeedingSchema.updateMany(
            {$in: {userId: userIds}, fundingStatus: false},
            [{$set: {"previousBalance": '$balance', 'balance': { $multiply: [ 15000, "$feedingType" ] }, "lastFunding": todaysDate, fundingStatus: true}}], 
            {multi: true}
        )
                
        let statistics = await userFeedingSchema.aggregate([
            { $match: 
                { 
                    userId: {
                        $in: userIds
                    }

                } 
            }, 
            {
                $group:
                { 
                    _id: null,
                    amount: { $sum: "$balance" },
                }
            }
           
        ])

        let totalAmount = (statistics[0].amount)
        await disbursementSchema.create({
            amount: totalAmount,
            numberOfStudents: user.modifiedCount
        })
    
        res.status(200).send({status: true, message: "Update Successful"})
    }
    catch(err){
        console.log(err)
        return next(new AppError("Error In Update", 400));
    }

})

exports.totalDisbursed = catchAsync(async(req, res, next) => {
    
})

// Save Hashed Pin
// Reset Pin

