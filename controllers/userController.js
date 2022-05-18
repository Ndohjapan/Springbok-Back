const User = require("../models/UserModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const {userFeedingSchema} = require("../models/userFeedingModel")


exports.getAllUsers = catchAsync(async(req, res, next) => {
    const user = await User.find({})

    res.status(200).send({status: true, message: "Successful", data: user})
})

exports.getUser = catchAsync(async(req, res, next) => {
    const user = await User.findById(req.params.id)

    res.status(200).send({status: true, message: "Successful", data: user})
})

exports.updateUser = catchAsync(async(req, res, next) => {
    let data = req.body
    let updateData = {}

    Object.entries(data).forEach(([key, value]) => {
        if(value != ""){
            updateData[key] = value
        }
    })

    let user = await User.findByIdAndUpdate(req.params.id, updateData, {new: true})

    res.status(200).send({status: true, message: "User Updated", data: user})
})

exports.deleteUser = catchAsync(async(req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id)

    res.status(204).send({status: true, message: "User Deleted"})
})


exports.postFilter = catchAsync(async(req, res, next) => {
    let data = req.body
    let updateData = {}

    Object.entries(data).forEach(([key, value]) => {
        if(value != ""){
            updateData[key] = value
        }
    })

    let user = await User.find(updateData)

    res.status(200).send({status: true, message: "Successful", data: user})
})
