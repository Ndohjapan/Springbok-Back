const {restaurantSchema, transactionSchema, userSchema} = require("../../models/mainModel")
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const bcrypt = require("bcrypt")

exports.postRestaurant = catchAsync(async(req, res, next) => {
    const {name, number} = req.body
    const createdBy = req.user["_id"]

    let firstname = name.split(" ")[0]
    let lastname = name.split(" ").slice(1).join('') ?  name.split(" ").slice(1).join(' ') : "Restaurant"
    let email = name.split(" ").slice(1).join('') ?  name.split(" ")[0].toLowerCase()+name.split(" ")[1].toLowerCase()+"@lcu.edu.ng" : name.split(" ")[0].toLowerCase()+"@lcu.edu.ng"
    let avatar = "https://res.cloudinary.com/billingshq/image/upload/v1646363586/springsbok/restaurant_qzb7vt.png"

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("12345678", salt);
    const restaurant = await restaurantSchema.create({
        name, userId: user["_id"].toString(), email, logo: avatar, password
    })


    // res.status(200).send({status: true, message: "Restaurant Created", data: restaurant})
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

    if(updateData["password"]){
        const salt = await bcrypt.genSalt(10);
        let password = updateData["password"]
        updateData["password"] = await bcrypt.hash(password, salt);
    }

    let food = await restaurantSchema.findOneAndUpdate({_id: req.params.id}, updateData, {new: true}).select("-balance -previousBalance")

    res.status(200).send({status: true, message: "Restaurant Updated", data: food})
})

exports.deleteRestaurant = catchAsync(async(req, res, next) => {
    let restaurantId = req.params.id
    const food = await restaurantSchema.findByIdAndDelete(req.params.id)
    await transactionSchema.deleteMany({to: restaurantId})
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

        
        const options = {
            page: page,
            limit: limit,
            sort: {"createdAt": -1},
            populate: ["from", "to"]
        };


        transactionSchema.paginate({createdAt:{$gte:new Date(from),$lte:new Date(to)}, to: restaurantId}, options, function(err, result) {
            if(err){
                return next(new AppError(err, 400));

            }else{
                return res.status(200).send({status: true, result: result.docs, statistics: statistics})
            }
        })
        
    }
    catch(err){
        return next(new AppError(err, 400));
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
        

        transactionSchema.paginate({createdAt:{$gte:new Date(from),$lte:new Date(to)}}, options, function(err, result) {
            if(err){
                return next(new AppError(err, 400));
            }else{
                return res.status(200).send({status: true, result: result.docs, statistics: statistics})
            }
        })
        
    }
    catch(err){
        return next(new AppError(err, 400));
    }
    
})