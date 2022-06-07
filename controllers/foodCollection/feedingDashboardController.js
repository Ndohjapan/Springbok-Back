const {utilsSchema, userFeedingSchema, transactionSchema, disbursementSchema, adminSchema} = require("../../models/mainModel")
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const bcrypt = require("bcrypt");
const {success} = require("../../utils/activityLogs")

exports.getUsersDetails = catchAsync(async(req, res, next) => {
    let usersAggregate = [
        {
          '$group': {
            '_id': '0', 
            'docs': {
              '$push': '$$ROOT'
            }, 
            'totalUsers': {
              '$count': {}
            }
          }
        }, {
          '$unwind': {
            'path': '$docs', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$group': {
            '_id': '$docs.studentStatus', 
            'studentStatus': {
              '$first': '$docs.studentStatus'
            }, 
            'Students': {
              '$count': {}
            }, 
            'totalUsers': {
              '$first': '$totalUsers'
            }
          }
        }, {
          '$project': {
            '_id': 0
          }
        }
    ]

    let userData = await userFeedingSchema.aggregate(usersAggregate)
    let newUserAlert = await utilsSchema.find({}).select({_id: 0, newStudentAlert: 1})

    return res.status(200).send({status: true, message: "Successfull", userData, newUserAlert})
})

exports.getTransactionsDetails = catchAsync(async(req, res, next) => {
    let transactionAgreggate = [
        {
          '$addFields': {
            'toId': {
              '$toObjectId': '$to'
            }
          }
        }, {
          '$lookup': {
            'from': 'restaurants', 
            'localField': 'toId', 
            'foreignField': '_id', 
            'as': 'restaurant'
          }
        }, {
          '$unwind': {
            'path': '$restaurant', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$group': {
            '_id': 0, 
            'docs': {
              '$push': '$$ROOT'
            }, 
            'totalTransactions': {
              '$count': {}
            }, 
            'totalAmount': {
              '$sum': '$amount'
            }
          }
        }, {
          '$unwind': {
            'path': '$docs'
          }
        }, {
          '$group': {
            '_id': '$docs.to', 
            'transactions': {
              '$count': {}
            }, 
            'amount': {
              '$sum': '$docs.amount'
            }, 
            'restaurantName': {
              '$first': '$docs.restaurant.name'
            }, 
            'totalTransactions': {
              '$first': '$totalTransactions'
            }, 
            'totalAmount': {
              '$first': '$totalAmount'
            }
          }
        }
    ]

    let transactionData = await transactionSchema.aggregate(transactionAgreggate)
    return res.status(200).send({status: true, message: "Succssful", data: transactionData})
})

exports.getDisbursementDetails = catchAsync(async(req, res, next) => {

  let disbursementAggregate = [
    {
      '$group': {
        '_id': 0, 
        'totalAmount': {
          '$sum': '$amount'
        }, 
        'lastupdate': {
          '$max': '$createdAt'
        }
      }
    }, {
      '$project': {
        '_id': 0
      }
    }
  ]

  let disbursementData = await disbursementSchema.aggregate(disbursementAggregate)
  res.status(200).send({status: true, message:"Successful", data: disbursementData})

})

exports.createAdmin = catchAsync(async (req, res, next) => {

  const socket = req.app.get("socket");
  let userId = req.user["_id"].toString()

  const { firstname, lastname, email, password, number, role, permissions } = req.body;

  if (await adminSchema.findOne({ email }))
    return next(new AppError("User already exists", 400));

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  try{

    const user = await adminSchema.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      number, role, permissions
    });
  
    const token = await user.generateAuthToken();
  
    res.status(201).json({ status: true, data: user, token });
  
    return success(userId, ` added ${user.firstname} ${user.lastname} as an admin`, "Create", socket)
  }
  catch(err){
    return res.status(400).send({status:false, message: err.message})
  }


});

exports.updateAdmins = catchAsync(async(req, res, next) => {
  const socket = req.app.get("socket");
  let userId = req.user["_id"].toString()
  
  let data = req.body
  let updateData = {}

  let activityMessage = []

  Object.entries(data).forEach(([key, value]) => {
      if(value != ""){
          updateData[key] = value
          activityMessage.push(key)
      }
  })

  activityMessage = activityMessage.join(", ")

  if(updateData["password"]){
    const salt = await bcrypt.genSalt(10);
    let password = updateData["password"]
    updateData["password"] = await bcrypt.hash(password, salt);
  }

  let subAdmins = await adminSchema.findOneAndUpdate({_id: req.params.id}, updateData, {new: true})

  res.status(200).send({status: true, message: "Sub Admin Updated", data: subAdmins})

  success(userId, ` updated ${subAdmins.firstname} ${subAdmins.lastname}'s: ${activityMessage}`, "Update", socket)

})

exports.getAllAdmins = catchAsync(async(req, res, next) => {
  let admins = await adminSchema.find({})

  return res.status(200).send({status: true, message: "Successful", data: admins})

})

exports.deleteAdmins = catchAsync(async(req, res, next) => {
  const socket = req.app.get("socket");
  let userId = req.user["_id"].toString()

  if(userId === req.params.id){
    return res.status(403).send({status:false, message: "You Cannot Delete This Account"})
  }else{
    await adminSchema.findByIdAndDelete(req.params.id)
  
    res.status(200).send({status: true, message: "Admin Deleted"})
  
    return success(userId, ` deleted an admin from database`, "Delete", socket)
    
  }


})

exports.unreadNotifications = catchAsync(async(req, res, next) => {
  let utils = await utilsSchema.find({})

  return res.status(200).send({status: true, message: "Successful", unreadNotifications: utils[0].unreadNotifications})

})

exports.allPermissions = catchAsync(async(req, res, next) => {
  let utils = await utilsSchema.find({})

  return res.status(200).send({status: true, message: "Successful", permissions: utils[0].permissions})

})

