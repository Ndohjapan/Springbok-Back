const userFeedingModel = require("../../models/userFeedingModel")
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
    const user = await userFeedingModel.find({})

    res.status(200).send({status: true, message: "Successful", data: user})
})

exports.getUser = catchAsync(async(req, res, next) => {
    const user = await userFeedingModel.findOne({userId: req.params.id})

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

    let user = await userFeedingModel.findOneAndUpdate({userId: req.params.id}, updateData, {new: true})

    res.status(200).send({status: true, message: "User Updated", data: user})
})

exports.deleteUser = catchAsync(async(req, res, next) => {
    const user = await userFeedingModel.findOneAndDelete({userId: req.params.id})

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

    let user = await userFeedingModel.find(updateData)

    res.status(200).send({status: true, message: "Successful", data: user})
})

// Save Hashed Pin
// Reset Pin

