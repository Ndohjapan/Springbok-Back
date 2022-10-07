const {restaurantSchema, transactionSchema, userSchema} = require("../../models/mainModel")
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const bcrypt = require("bcrypt")
const {success} = require("../../utils/activityLogs")


exports.postRestaurant = catchAsync(async(req, res, next) => {

    const socket = req.app.get("socket");
    let userId = req.user["id"].toString()

    const {name, number} = req.body
    const createdBy = req.user["id"]

    let firstname = name.split(" ")[0]
    let lastname = name.split(" ").slice(1).join('') ?  name.split(" ").slice(1).join(' ') : "Restaurant"
    let email = name.split(" ").slice(1).join('') ?  name.split(" ")[0].toLowerCase()+name.split(" ")[1].toLowerCase()+"@lcu.edu.ng" : name.split(" ")[0].toLowerCase()+"@lcu.edu.ng"
    let avatar = "https://leadcity.s3.eu-west-2.amazonaws.com/1656238457405.png"

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("12345678", salt);
    const restaurant = await restaurantSchema.create({
        name, email, logo: avatar, password
    })


    // res.status(200).send({status: true, message: "Restaurant Created", data: restaurant})
    res.status(200).send({status: true, message: "Restaurant Created", data: restaurant})
    return success(userId, ` created a new restaurant ${name}`, "Create", socket)

})

exports.getAllRestaurants = catchAsync(async(req, res, next) => {
    const food = await restaurantSchema.find({})

    res.status(200).send({status: true, message: "Successful", data: food})
})

exports.getRestaurant = catchAsync(async(req, res, next) => {
    const food = await restaurantSchema.findById(req.params.id).select("-balance -previousBalance")

    res.status(200).send({status: true, message: "Successful", data: food})
})

exports.updateRestaurant = catchAsync(async(req, res, next) => {
    let data = req.body
    let updateData = {}

    const socket = req.app.get("socket");
    let userId = req.user["id"].toString()

    let activityMessage = []


    Object.entries(data).forEach(([key, value]) => {
        if(value != ""){
            updateData[key] = value
            activityMessage.push(key)
        }
    })
    
    if(updateData["password"]){
        const salt = await bcrypt.genSalt(10);
        let password = updateData["password"]
        updateData["password"] = await bcrypt.hash(password, salt);
        activityMessage.push("password")
    }
    activityMessage = activityMessage.join(", ")
    
    let restaurant = await restaurantSchema.findOneAndUpdate({id: req.params.id}, updateData, {new: false}).select("-balance -previousBalance")

    res.status(200).send({status: true, message: "Restaurant Updated"})

    return success(userId, ` updated ${restaurant.name}: ${activityMessage}`, "Update", socket)

})

exports.deleteRestaurant = catchAsync(async(req, res, next) => {
    const socket = req.app.get("socket");
    let userId = req.user["id"].toString()
    
    let restaurantId = req.params.id
    
    const food = await restaurantSchema.findByIdAndDelete(req.params.id)
    await transactionSchema.deleteMany({to: restaurantId})
    
    res.status(200).send({status: true, message: "Restaurant Deleted"})
    
    return success(userId, ` deleted a restaurant from Database`, "Delete", socket)
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
        let {restaurantId, from, to} = req.body;
        let response = dateFormat(from, to)
        from = response[0]
        to = response[1]

        console.log(restaurantId)
        let statistics = await transactionSchema.aggregate([
            {
                '$match': {
                    'to': `${restaurantId}`,
                    'createdAt': {
                        '$gte': from, 
                        '$lte': to
                    }
                }
              },
            {
                '$group': {
                  '_id': null, 
                  'amount': {
                    '$sum': '$amount'
                  }, 
                  'transactions': {
                    '$sum': 1
                  }
                }
              }
        
        ])

        let page = req.query.page ? req.query.page : 1
        let limit = req.query.limit ? req.query.limit : 1000000000

        
        const options = {
            sort: {"createdAt": -1},
            populate: ["from", "to"],
            page: page,
            limit: limit
        };


        transactionSchema.paginate({createdAt:{$gte:from,$lte:to}, to: restaurantId}, options, function(err, result) {
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
        let response = dateFormat(from, to)
        from = response[0]
        to = response[1]

        let statistics = await transactionSchema.aggregate([
            {
              '$match': {
                'createdAt': {
                  '$gte': from, 
                  '$lte': to
                }
              }
            }, {
              '$group': {
                '_id': null, 
                'amount': {
                  '$sum': '$amount'
                }, 
                'transactions': {
                  '$sum': 1
                }
              }
            }
          ])


        let page = req.query.page ? req.query.page : 1
        let limit = req.query.limit ? req.query.limit : 100000000000

        const options = {
            sort: {"createdAt": -1},
            populate: ["from", "to"],
            page: page,
            limit: limit
        };
        

        transactionSchema.paginate({createdAt:{$gte:from,$lte:to}}, options, function(err, result) {
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

function dateFormat(from, to){
    from = new Date(from)
    from.setHours(1)
    from.setMinutes(0)
    from.setSeconds(0)
    
    to = new Date(to)
    to.setHours(24)
    to.setMinutes(59)
    to.setSeconds(59)

    return [from, to]
}
