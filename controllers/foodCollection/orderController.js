const {orderSchema} = require("../../models/mainModel")
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");

exports.postOrder = catchAsync(async(req, res, next) => {
    const {orderId, restaurant, totalAmount, food} = req.body
    const createdBy = req.user["_id"]

    const order = await orderSchema.create({
        orderId, restaurant, totalAmount, food, createdBy
    })

    res.status(201).send({status: true, message: "Order Created", data: order})
})

exports.getAllOrders = catchAsync(async(req, res, next) => {
    const order = await orderSchema.find({})

    res.status(200).send({status: true, message: "Successful", data: order})
})

exports.getOrder = catchAsync(async(req, res, next) => {
    const order = await orderSchema.findById(req.params.id)

    res.status(200).send({status: true, message: "Successful", data: order})
})

exports.updateOrder = catchAsync(async(req, res, next) => {
    let data = req.body
    let updateData = {}

    Object.entries(data).forEach(([key, value]) => {
        if(value != ""){
            updateData[key] = value
        }
    })

    let order = await orderSchema.findByIdAndUpdate(req.params.id, updateData, {new: true})

    res.status(200).send({status: true, message: "Order Updated", data: order})
})

exports.deleteOrder = catchAsync(async(req, res, next) => {
    const order = await orderSchema.findByIdAndDelete(req.params.id)

    res.status(204).send({status: true, message: "Order Deleted"})
})


exports.postFilter = catchAsync(async(req, res, next) => {
    let data = req.body
    let updateData = {}

    Object.entries(data).forEach(([key, value]) => {
        if(value != ""){
            updateData[key] = value
        }
    })

    let order = await orderSchema.find(updateData)

    res.status(200).send({status: true, message: "Successful", data: order})
})

