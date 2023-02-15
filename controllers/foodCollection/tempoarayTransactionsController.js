const {userSchema, restaurantSchema, tempoararyTransactionsSchema} = require("../../models/mainModel")
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const bcrypt = require("bcrypt")
const {getCachedData, setCacheData, delcacheData} = require("../../utils/client")
const {success} = require("../../utils/activityLogs")


exports.getAllTransactions = catchAsync(async(req, res, next) => {
    
    let page = req.query.page ? req.query.page : 1
    let limit = req.query.limit ? req.query.limit : 100000000
    
    const options = {
        sort: {"createdAt": -1},
        populate: ["from", "to"],
        page: page,
        limit: limit
    };

    tempoararyTransactionsSchema.paginate({disabled: false}, options, function(err, result) {
        if(err){
            console.log(err)
            res.status(400).send(err)
        }else{
            res.status(200).send({status: true, message: "Successful", data: result.docs})
        }
    })
})

exports.getTransaction = catchAsync(async(req, res, next) => {
    const transaction = await tempoararyTransactionsSchema.findOne({_id: req.params.id, disabled: false}).populate(["from", "to"])

    res.status(200).send({status: true, message: "Successful", data: transaction})
})


exports.deleteTransaction = catchAsync(async(req, res, next) => {
    const socket = req.app.get("socket");
    let userId = req.user["_id"].toString()

    await tempoararyTransactionsSchema.findOneAndUpdate({_id: req.params.id, disabled: true})

    res.status(200).send({status: true, message: "Tranaction Deleted"})

  success(userId, ` deleted a transaction from Database`, "Delete", socket)

})


exports.postFilter = catchAsync(async(req, res, next) => {
    let data = req.body
    let updateData = {}
    
    let page = req.query.page ? req.query.page : 1
    let limit = req.query.limit ? req.query.limit : 100000000

    Object.entries(data).forEach(([key, value]) => {
        if(value != ""){
            updateData[key] = value
        }
    })

    updateData.disabled = false


    const options = {
        sort: {"createdAt": -1},
        populate: ["from", "to"],
        page: page,
        limit: limit
    };

    tempoararyTransactionsSchema.paginate(updateData, options, function(err, result) {
        if(err){
            console.log(err)
            res.status(400).send(err)
        }else{
            res.status(200).send({status: true, message: "Successful", data: result.docs})
        }
    })
})
