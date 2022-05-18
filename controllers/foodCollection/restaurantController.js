const {restaurantSchema, transactionSchema} = require("../../models/restaurantModel")
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

exports.restaurantTransactions = catchAsync(async(req, res, next) => {
    try{
        let {restaurantId, from, to} = req.body
    
        let statistics = transactionSchema.aggregate([
            { $match: 
                { 
                    createdAt: {
                        $gte: new Date(from),
                        $lt: new Date(to)
                    },
                    to: restaurantId

                } 
            }, 
            {
                $group:
                { 
                    _id: null,
                    amount: { $sum: "$amount" },
                    transactions: {$sum: 1}
                }
            }
        
        ])

        let transactions = transactionSchema.find({createdAt:{$gte:new Date(from),$lt:new Date(to)}, to: restaurantId}).populate(["from", "to"])
        
        let promises = [statistics, transactions]

        Promise.all(promises).then(results => {
            statistics = results[0]
            transactions = results[1]

            res.status(200).send({status: true, result: transactions, totalAmount: statistics[0].amount, transactions: statistics[0].transactions })

        })
        
    }
    catch(err){
        console.log(err)
        res.status(400).send({status: false, message: "Error in Update"})
    }
    
})


exports.allTransactions = catchAsync(async(req, res, next) => {
    try{
        let {from, to} = req.body
    
        let statistics = transactionSchema.aggregate([
            { $match: 
                { 
                    createdAt: {
                        $gte: new Date(from),
                        $lt: new Date(to)
                    }
                } 
            }, 
            {
                $group:
                { 
                    _id: null,
                    amount: { $sum: "$amount" },
                    transactions: {$sum: 1}
                }
            }
        
        ])

        let transactions = transactionSchema.find({createdAt:{$gte:new Date(from),$lt:new Date(to)}}).populate(["from", "to"])
        
        let promises = [statistics, transactions]

        Promise.all(promises).then(results => {
            statistics = results[0]
            transactions = results[1]
            res.status(200).send({status: true, result: transactions, totalAmount: statistics[0].amount, transactions: statistics[0].transactions })

        })
        
    }
    catch(err){
        console.log(err)
        res.status(400).send({status: false, message: "Error in Update"})
    }
    
})