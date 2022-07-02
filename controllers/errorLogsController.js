const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const {errorSchema} = require("../models/mainModel")

exports.postError = catchAsync(async(req, res, next) => {
    const {message} = req.body
    let device = req.headers["user-agent"]
    let ip = req.ip
    const error = await errorSchema.create({message, device, ip});

    res.status(200).send({status: true, message: "Successful", data: error})
})

exports.getAllErrors = catchAsync(async(req, res, next) => {

    let page = req.query.page ? req.query.page : 1
    let limit = req.query.limit ? req.query.limit : 60

    const options = {
        page: page,
        limit: limit,
        sort: {"createdAt": -1},
        
    };

    errorSchema.paginate({role: {$ne: "restaurant"}}, options, function(err, result) {
        if(err){
            console.log(err)
            res.status(400).send(err)
        }else{
            res.status(200).send({status: true, message: "Successful", payload: result.docs})
        }
    })
})

exports.getError = catchAsync(async(req, res, next) => {
    const error = await errorSchema.findById(req.params.id)

    res.status(200).send({status: true, message: "Successful", data: error})
})

exports.updateError = catchAsync(async(req, res, next) => {
    let data = req.body
    let updateData = {}

    Object.entries(data).forEach(([key, value]) => {
        if(value != ""){
            updateData[key] = value
        }
    })

    let error = await errorSchema.findByIdAndUpdate(req.params.id, updateData, {new: true})

    res.status(200).send({status: true, message: "User Updated", data: error})
})

exports.deleteError = catchAsync(async(req, res, next) => {
    let errorId = req.params.id
    const error = await errorSchema.findByIdAndDelete(errorId)
    
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

    let error = await errorSchema.find(updateData)

    res.status(200).send({status: true, message: "Successful", data: error})
})
