const {restaurantSchema} = require("../../models/restaurantModel")
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");

exports.postRestaurant = catchAsync(async(req, res, next) => {
    const {name} = req.body
    const createdBy = req.user["_id"]
    console.log(createdBy)

    const restaurant = await restaurantSchema.create({
        name
    })

    res.status(200).send({status: true, message: "Restaurant Created", data: restaurant})
})

exports.getAllRestaurants = catchAsync(async(req, res, next) => {
    const food = await restaurantSchema.find({}).select("-balance -previousBalance")

    res.status(200).send({status: true, message: "Successful", data: food})
})

exports.getRestaurant = catchAsync(async(req, res, next) => {
    const food = await restaurantSchema.findById(req.params.id).select("-balance -previousBalance")

    res.status(200).send({status: true, message: "Successful", data: food})
})

exports.updateRestaurant = catchAsync(async(req, res, next) => {
    let data = req.body
    let updateData = {}

    Object.entries(data).forEach(([key, value]) => {
        if(value != ""){
            updateData[key] = value
        }
    })

    let food = await restaurantSchema.findOneAndUpdate({_id: req.params.id}, updateData, {new: true}).select("-balance -previousBalance")

    res.status(200).send({status: true, message: "Restaurant Updated", data: food})
})

exports.deleteRestaurant = catchAsync(async(req, res, next) => {
    const food = await restaurantSchema.findByIdAndDelete(req.params.id)

    res.status(200).send({status: true, message: "Restaurant Deleted"})
})


exports.postFilter = catchAsync(async(req, res, next) => {
    let data = req.body
    let updateData = {}

    Object.entries(data).forEach(([key, value]) => {
        if(value != ""){
            updateData[key] = value
        }
    })

    let food = await restaurantSchema.find(updateData).select("-balance -previousBalance")

    res.status(200).send({status: true, message: "Successful", data: food})
})

