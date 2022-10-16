const {utilsSchema, transactionSchema, restaurantSchema, userFeedingSchema, disbursementSchema, userSchema} = require("../../models/mainModel")
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const bcrypt = require("bcrypt")
const moment = require("moment")
const {success} = require("../../utils/activityLogs")
    

exports.savePin = catchAsync(async(req, res, next) => {
    let {transactionPin} = req.body
    let userId = req.user["_id"]
    transactionPin = bcrypt.hashSync(transactionPin, 10)

    const user = await userFeedingSchema.create({
      userId, transactionPin  
    })

    res.status(201).send({status: true, message: "User Created", data: user})
})

exports.getAllUsers = catchAsync(async(req, res, next) => {

    let page = req.query.page ? req.query.page : 1
    let limit = req.query.limit ? req.query.limit : 1000000

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
    

    let userId = req.user["_id"].toString()
    let {transactionPin, newTransactionPin} = req.body

    const user = await userFeedingSchema.findOne({userId: userId});
    
    const checkPin = await user.checkPin(transactionPin);

    if(!checkPin){
        return next(new AppError("Wrong Pin", 400));
    }

    newTransactionPin = bcrypt.hashSync(newTransactionPin, 10)

    await userFeedingSchema.findOneAndUpdate({userId: userId}, {transactionPin: newTransactionPin}, {new: true})

    res.status(200).send({status: true, message: "Successful"})
})

exports.confirmPin = catchAsync(async(req, res, next) => {
    let userId = req.user["_id"].toString()
    let {transactionPin} = req.body

    const user = await userFeedingSchema.findOne({userId: userId});
    
    const checkPin = await user.checkPin(transactionPin);

    if(!checkPin){
        return next(new AppError("Wrong Pin", 400));
    }

    return res.status(200).send({status: true, message: "Pin Is Correct"})
    
})

exports.updateUser = catchAsync(async (req, res, next) => { 
    let data = req.body; 
    let updateData = {}; 
    Object.entries(data).forEach(([key, value]) => { 
        
        if (value != "") { 
            updateData[key] = value; 
        } 
    }); 
    
    let user = await userFeedingSchema.updateOne({userId: req.params.id}, updateData, { new: true, }); 
    
    user = await userFeedingSchema.findOne({userId: req.params.id}); 
    
    res.status(200).send({ status: true, message: "User Updated", data: user });});

exports.deleteUser = catchAsync(async(req, res, next) => {
    const socket = req.app.get("socket");
    let userId = req.user["_id"].toString()

    const user = await userFeedingSchema.findOneAndDelete({userId: req.params.id})

    res.status(200).send({status: true, message: "User Deleted"})
    return success(userId, ` deleted a user from database`, "Delete", socket)

})


exports.postFilter = catchAsync(async(req, res, next) => {
    let data = req.body
    let updateData = {}

    Object.entries(data).forEach(([key, value]) => {
        if(value != ""){
            updateData[key] = value
        }
    })

    let page = req.query.page ? req.query.page : 1
    let limit = req.query.limit ? req.query.limit : 1000000

    const options = {
        page: page,
        limit: limit,
        sort: {"createdAt": -1},
        populate: ["userId"]
    };

    userFeedingSchema.paginate(updateData, options, function(err, result) {
        if(err){
            console.log(err)
            res.status(400).send(err)
        }else{
            res.status(200).send({status: true, message: "Successful", data: result.docs})
        }
    })
})

exports.validateUsers = catchAsync(async(req,res, next) => {
    let {userIds, feedingType, studentStatus, amountPaid} = req.body
    let totalFeedingAmount = amountPaid
    const socket = req.app.get("socket");
    let userId = req.user["_id"].toString()
    try{
        let userUpdate = userSchema.updateMany({"_id": {$in: userIds}}, {$set: {studentStatus: studentStatus}})
        let feedingUpdate = userFeedingSchema.updateMany({userId: {$in: userIds}, studentStatus: false}, {$set: {feedingType: feedingType, studentStatus: studentStatus, totalFeedingAmount: totalFeedingAmount, amountLeft: totalFeedingAmount}})
        let newStudentAlert = utilsSchema.updateMany({}, {$set: {newStudentAlert: 0}})
    
        let promises = [userUpdate, feedingUpdate, newStudentAlert]
    
        Promise.all(promises).then(results => {
            res.status(200).send({status: true, message:"Update Successful"})
            return success(userId, ` validated ${results[0].modifiedCount} students`, "Update", socket)


        })
    }
    catch(err){
        console.log(err)
        return next(new AppError("Error in Update", 400));
    }

}) 

exports.editTotalFunds = catchAsync(async(req,res, next) => {
    let {newTotalAmount, userId} = req.body
    try{
        let feedingUpdate = await userFeedingSchema.updateMany({userId: {$in: userId}}, 
            [
                {$set: {
                    "totalFeedingAmount": newTotalAmount,
                    "amountLeft": {$subtract: [newTotalAmount, "$totalAmountFunded"]}
                    },
                }
            ], 
            {multi: true}
        )
    
        return res.status(200).send({status: true, message:"Update Successful"})
    
    }
    catch(err){
        console.log(err)
        return next(new AppError("Error in Update", 400));
    }

}) 

exports.invalidateUsers = catchAsync(async(req,res, next) => {
    let {userIds, studentStatus} = req.body
    let totalFeedingAmount = 0
    const socket = req.app.get("socket");
    let userId = req.user["_id"].toString()
    try{
        let userUpdate = userSchema.updateMany({"_id": {$in: userIds}}, {$set: {studentStatus: studentStatus}})
        let feedingUpdate = userFeedingSchema.updateMany({userId: {$in: userIds}}, {$set: {feedingType: 2, studentStatus: studentStatus, totalFeedingAmount: totalFeedingAmount, fundingStatus: studentStatus, balance: 0, previousBalance: 0, totalAmountFunded: 0}})
        let newStudentAlert = utilsSchema.updateMany({}, {$set: {newStudentAlert: 0}})
    
        let promises = [userUpdate, feedingUpdate, newStudentAlert]
    
        Promise.all(promises).then(results => {
            res.status(200).send({status: true, message:"Update Successful"})
            return success(userId, ` invalidated ${results[0].modifiedCount} students`, "Update", socket)


        })
    }
    catch(err){
        console.log(err)
        return next(new AppError("Error in Update", 400));
    }

}) 

exports.fundWallet = catchAsync(async(req, res, next) => {
    let {userIds} = req.body
    const socket = req.app.get("socket");
    let userId = req.user["_id"].toString()
    
    let feedingAmount = await utilsSchema.find()
    feedingAmount = feedingAmount[0].feedingAmount
    
    try{

        let todaysDate = new Date().toISOString()
        let fundingDay = moment(todaysDate, 'YYYY-MM-DD').format("YYYY-MM-DD");
    
        let canBeFunded = await checkIfStudentCanBeFunded(userIds, feedingAmount)
        let negativeStudents = await fundAllNegativeStudents(userIds, fundingDay, feedingAmount)
        let positiveStudents = await fundAllPositiveStudents(userIds, fundingDay, feedingAmount)

        let user = { "acknowledged": true,
                    "insertedId": null,
                    "matchedCount": positiveStudents.matchedCount + negativeStudents.matchedCount,
                    "modifiedCount": positiveStudents.modifiedCount + negativeStudents.modifiedCount,
                    "upsertedCount": positiveStudents.upsertedCount + negativeStudents.upsertedCount
                }
        
        let statistics = await userFeedingSchema.aggregate([
            {
              '$match': {
                'userId': {
                  '$in': userIds
                },
                "lastFunding": fundingDay
              }
            }, {
              '$unwind': {
                'path': '$userId', 
                'preserveNullAndEmptyArrays': true
              }
            }, {
              '$group': {
                '_id': null, 
                'amount': {
                  '$sum': '$balance'
                }
              }
            }
        ])
        
        
        let totalAmount = (statistics[0]) ? statistics[0].amount : 0
        await disbursementSchema.create({
            amount: totalAmount,
            numberOfStudents: user.modifiedCount
        })
    
        res.status(200).send({status: true, message: "Update Successful"})

        return success(userId, ` funded ${user.modifiedCount} students with total of ${totalAmount} naira`, "Update", socket)

    }
    catch(err){
        console.log(err)
        return next(new AppError("Error In Update", 400));
    }

})

exports.fundAllLegibleWallets = catchAsync(async(req, res, next) => {
    const socket = req.app.get("socket");
    let userId = req.user["_id"].toString()
    
    let feedingAmount = await utilsSchema.find()
    feedingAmount = feedingAmount[0].feedingAmount
    
    try{

        let todaysDate = new Date().toISOString()
        let fundingDay = moment(todaysDate, 'YYYY-MM-DD').format("YYYY-MM-DD");
    
        await checkIfStudentCanBeFundedToday(feedingAmount)
        let negativeStudents = await fundAllNegativeStudentsToday(fundingDay, feedingAmount)
        let positiveStudents = await fundAllPositiveStudentsToday(fundingDay, feedingAmount)

        let user = { "acknowledged": true,
                    "insertedId": null,
                    "matchedCount": positiveStudents.matchedCount + negativeStudents.matchedCount,
                    "modifiedCount": positiveStudents.modifiedCount + negativeStudents.modifiedCount,
                    "upsertedCount": positiveStudents.upsertedCount + negativeStudents.upsertedCount
                }
        
        let statistics = await userFeedingSchema.aggregate([
            {
              '$match': {
                "lastFunding": fundingDay
              }
            }, {
              '$unwind': {
                'path': '$userId', 
                'preserveNullAndEmptyArrays': true
              }
            }, {
              '$group': {
                '_id': null, 
                'amount': {
                  '$sum': '$balance'
                }
              }
            }
        ])
        
        
        let totalAmount = (statistics[0]) ? statistics[0].amount : 0
        await disbursementSchema.create({
            amount: totalAmount,
            numberOfStudents: user.modifiedCount
        })
    
        res.status(200).send({status: true, message: "Update Successful"})

        return success(userId, ` funded ${user.modifiedCount} students who are legible after 30 days with total of ${totalAmount} naira`, "Update", socket)

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

async function checkIfStudentCanBeFunded(userIds, feedingAmount){
    let user = await userFeedingSchema.updateMany(
        {fundingStatus: false, userId: {$in: userIds}, studentStatus: true}, 
        [
            {$set: {
                'fundingCheck': {$subtract: ["$amountLeft", { $multiply: [ feedingAmount, "$feedingType" ] }]}
                },
            }
        ], 
        {multi: true}
    )

    return user
}

async function checkIfStudentCanBeFundedToday(feedingAmount){
    let user = await userFeedingSchema.updateMany(
        {fundingStatus: false, studentStatus: true}, 
        [
            {$set: {
                'fundingCheck': {$subtract: ["$amountLeft", { $multiply: [ feedingAmount, "$feedingType" ] }]}
                },
            }
        ], 
        {multi: true}
    )

    return user
}

async function fundAllPositiveStudentsToday(fundingDay, feedingAmount){
    console.log(fundingDay)
    let user = await userFeedingSchema.updateMany(
        {fundingStatus: false, studentStatus: true, fundingCheck: {$gt: 0}}, 
        [
            {$set: {
                "previousBalance": '$balance',
                "lastFunding": fundingDay, 
                "lastFundingDay": fundingDay,
                'fundingStatus': true, 
                'totalAmountFunded': {$add: ["$totalAmountFunded", { $multiply: [ feedingAmount, "$feedingType" ] }]},
                'balance': {$add: ["$balance", { $multiply: [ feedingAmount, "$feedingType" ] }]},
                'numOfTimesFunded': {$add: ["$numOfTimesFunded", 1]},
                "amountLeft": {$subtract: ["$totalFeedingAmount",  {$add: ["$totalAmountFunded", { $multiply: [ feedingAmount, "$feedingType" ] }]}]}
                },
            }
        ], 
        {multi: true}
    )

    return user
}

async function fundAllNegativeStudentsToday(fundingDay, feedingAmount){
    console.log(fundingDay)
    let user = await userFeedingSchema.updateMany(
        {fundingCheck: {$lte: 0}, fundingStatus: false, studentStatus: true}, 
        [
            {$set: {
                "previousBalance": '$balance',
                "lastFunding": fundingDay, 
                "lastFundingDay": fundingDay,
                'fundingStatus': true, 
                'totalAmountFunded': {$add: ["$totalAmountFunded", "$amountLeft"]},
                'numOfTimesFunded': {$add: ["$numOfTimesFunded", 1]},
                'balance': {$add: ["$amountLeft", "$balance"]},
                "amountLeft": 0 
                },
            }
        ], 
        {multi: true}
    )

    return user
}

async function fundAllPositiveStudents(userIds, fundingDay, feedingAmount){
    console.log(fundingDay)
    let user = await userFeedingSchema.updateMany(
        {fundingCheck: {$gt: 0}, fundingStatus: false, userId: {$in: userIds}}, 
        [
            {$set: {
                "previousBalance": '$balance',
                "lastFunding": fundingDay, 
                "lastFundingDay": fundingDay,
                'fundingStatus': true, 
                'totalAmountFunded': {$add: ["$totalAmountFunded", { $multiply: [ feedingAmount, "$feedingType" ] }]},
                'balance':  {$add: ["$balance", { $multiply: [ feedingAmount, "$feedingType" ] }]},
                'numOfTimesFunded': {$add: ["$numOfTimesFunded", 1]},
                "amountLeft": {$subtract: ["$totalFeedingAmount",  {$add: ["$totalAmountFunded", { $multiply: [ feedingAmount, "$feedingType" ] }]}]}
                },
            }
        ], 
        {multi: true}
    )

    return user
}

async function fundAllNegativeStudents(userIds, fundingDay, feedingAmount){
    console.log(fundingDay)
    let user = await userFeedingSchema.updateMany(
        {fundingCheck: {$lte: 0}, fundingStatus: false, userId: {$in: userIds}}, 
        [
            {$set: {
                "previousBalance": '$balance',
                "lastFunding": fundingDay, 
                "lastFundingDay": fundingDay,
                'fundingStatus': true, 
                'totalAmountFunded': {$add: ["$totalAmountFunded", "$amountLeft"]},
                'numOfTimesFunded': {$add: ["$numOfTimesFunded", 1]},
                'balance': {$add: ["$amountLeft", "$balance"]},
                "amountLeft": 0 
                },
            }
        ], 
        {multi: true}
    )

    return user
}
