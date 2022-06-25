const {userSchema, restaurantSchema, transactionSchema} = require("../../models/mainModel")
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const bcrypt = require("bcrypt")
const {success} = require("../../utils/activityLogs")


exports.getAllTransactions = catchAsync(async(req, res, next) => {

    let page = req.query.page ? req.query.page : 1
    let limit = req.query.limit ? req.query.limit : 50

    const options = {
        page: page,
        limit: limit,
        sort: {"createdAt": -1},
        populate: ["from", "to"]
    };

    transactionSchema.paginate({}, options, function(err, result) {
        if(err){
            console.log(err)
            res.status(400).send(err)
        }else{
            res.status(200).send({status: true, message: "Successful", data: result.docs})
        }
    })
})

exports.getUserTransactions = catchAsync(async(req, res, next) => {

    let userId = req.user["_id"].toString()
    let page = req.query.page ? req.query.page : 1
    let limit = req.query.limit ? req.query.limit : 50

    const options = {
        page: page,
        limit: limit,
        sort: {"createdAt": -1},
        populate: ["from", "to"]
    };

    transactionSchema.paginate({from: userId}, options, function(err, result) {
        if(err){
            console.log(err)
            res.status(400).send(err)
        }else{
            res.status(200).send({status: true, message: "Successful", data: result.docs})
        }
    })
})

exports.getTransaction = catchAsync(async(req, res, next) => {
    const transaction = await transactionSchema.findOne({_id: req.params.id})

    res.status(200).send({status: true, message: "Successful", data: transaction})
})


exports.deleteTransaction = catchAsync(async(req, res, next) => {
    const socket = req.app.get("socket");
    let userId = req.user["_id"].toString()

    await transactionSchema.findOneAndDelete({_id: req.params.id})

    res.status(200).send({status: true, message: "Tranaction Deleted"})

  success(userId, ` deleted a transaction from Database`, "Delete", socket)

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
    let limit = req.query.limit ? req.query.limit : 50

    const options = {
        page: page,
        limit: limit,
        sort: {"createdAt": -1},
        populate: ["from", "to"]
    };

    transactionSchema.paginate(updateData, options, function(err, result) {
        if(err){
            console.log(err)
            res.status(400).send(err)
        }else{
            res.status(200).send({status: true, message: "Successful", data: result.docs})
        }
    })
})