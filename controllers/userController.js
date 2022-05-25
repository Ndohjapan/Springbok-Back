const User = require("../models/UserModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const {userFeedingSchema} = require("../models/userFeedingModel")


exports.getAllUsers = catchAsync(async(req, res, next) => {

    let page = req.query.page ? req.query.page : 1
    let limit = req.query.limit ? req.query.limit : 10

    const options = {
        page: page,
        limit: limit,
        sort: {"createdAt": -1},
        
    };

    User.paginate({}, options, function(err, result) {
        if(err){
            console.log(err)
            res.status(400).send(err)
        }else{
            res.status(200).send({status: true, message: "Successful", payload: result.docs})
        }
    })
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
    let userId = req.params.id
    const user = await User.findByIdAndDelete(req.params.id)
    await userFeedingSchema.findOneAndDelete({userId: userId})
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
