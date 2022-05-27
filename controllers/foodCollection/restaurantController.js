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
    
        let statistics = await transactionSchema.aggregate([
            { $match: 
                { 
                    createdAt: {
                        $gte: new Date(from),
                        $lte: new Date(to)
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


        let page = req.query.page ? req.query.page : 1
        let limit = req.query.limit ? req.query.limit : 50

        let result = await transactionSchema.find({createdAt:{$gte:new Date(from),$lt:new Date(to)}, to: restaurantId}).populate(["from", "to"])
        
        res.status(200).send({status: true, result: result, totalAmount: statistics})
        // const options = {
        //     page: page,
        //     limit: limit,
        //     sort: {"createdAt": -1},
        //     populate: ["from", "to"]
        // };

        // transactionSchema.paginate(, options, function(err, result) {
        //     if(err){
        //         console.log(err)
        //         res.status(400).send(err)
        //     }else{
        //     }
        // })
        
    }
    catch(err){
        console.log(err)
        res.status(400).send({status: false, message: "Error in Update"})
    }
    
})


exports.allTransactions = catchAsync(async(req, res, next) => {
    try{
        let {from, to} = req.body
    
        let statistics = await transactionSchema.aggregate([
            { $match: 
                { 
                    createdAt: {
                        $gte: new Date(from),
                        $lte: new Date(to)
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


        let page = req.query.page ? req.query.page : 1
        let limit = req.query.limit ? req.query.limit : 50

        const options = {
            page: page,
            limit: limit,
            sort: {"createdAt": -1},
            populate: ["from", "to"]
        };
        let result = await transactionSchema.find({createdAt:{$gte:new Date(from),$lt:new Date(to)}}).populate(["from", "to"])
        res.status(200).send({status: true, result: result, totalAmount: statistics})

        // transactionSchema.paginate({createdAt:{$gte:new Date(from),$lt:new Date(to)}}, options, function(err, result) {
        //     if(err){
        //         console.log(err)
        //         res.status(400).send(err)
        //     }else{
        //         res.status(200).send({status: true, result: result.docs, totalAmount: statistics[0].amount, transactions: statistics[0].transactions})
        //     }
        // })
        
    }
    catch(err){
        console.log(err)
        res.status(400).send({status: false, message: "Error in Update"})
    }
    
})