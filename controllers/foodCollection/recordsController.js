const {userSchema, restaurantSchema, recordsSchema} = require("../../models/mainModel")
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const bcrypt = require("bcrypt")
const {success} = require("../../utils/activityLogs")


exports.getAllRecords = catchAsync(async(req, res, next) => {

    let page = req.query.page ? req.query.page : 1
    let limit = req.query.limit ? req.query.limit : 100000000

    const options = {
        page: page,
        limit: limit,
        sort: {"createdAt": -1}
        
    };

    recordsSchema.paginate({}, options, function(err, result) {
        if(err){
            console.log(err)
            res.status(400).send(err)
        }else{
            res.status(200).send({status: true, message: "Successful", data: result.docs})
        }
    })
})

exports.getRecord = catchAsync(async(req, res, next) => {
    const transaction = await recordsSchema.findOne({_id: req.params.id})

    res.status(200).send({status: true, message: "Successful", data: transaction})
})


exports.deleteRecord = catchAsync(async(req, res, next) => {
    const socket = req.app.get("socket");
    let userId = req.user["_id"].toString()

    await recordsSchema.findOneAndDelete({_id: req.params.id})

    res.status(200).send({status: true, message: "Record Deleted"})

  success(userId, ` deleted a record from Database`, "Delete", socket)

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
    let limit = req.query.limit ? req.query.limit : 10000000

    const options = {
        page: page,
        limit: limit,
        sort: {"createdAt": -1}
        
    };

    recordsSchema.paginate(updateData, options, function(err, result) {
        if(err){
            console.log(err)
            res.status(400).send(err)
        }else{
            res.status(200).send({status: true, message: "Successful", data: result.docs})
        }
    })
})
