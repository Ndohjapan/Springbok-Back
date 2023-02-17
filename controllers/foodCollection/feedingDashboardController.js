const {utilsSchema, userFeedingSchema, transactionSchema, 
  disbursementSchema, adminSchema, recordsSchema, userSchema, restaurantSchema, restaurantTransactionsSchema, tempoararyTransactionsSchema} = require("../../models/mainModel")
const AppError = require("../../utils/appError");
const moment = require("moment")
const mongoose = require("mongoose")
const catchAsync = require("../../utils/catchAsync");
const bcrypt = require("bcrypt");
const {success} = require("../../utils/activityLogs")
const path = require("path")
const {getCachedData, setCacheData, delcacheData} = require("../../utils/client")
const {Worker} = require("worker_threads")

exports.getUsersDetails = catchAsync(async(req, res, next) => {
    let usersAggregate = [
      {
        '$group': {
          '_id': '$studentStatus', 
          'Students': {
            '$count': {}
          }, 
          'studentStatus': {
            '$first': '$studentStatus'
          }
        }
      }, {
        '$project': {
          '_id': 0
        }
      }
    ]
    let totalUsersAggregate = [
      {
        '$group': {
          '_id': null, 
          'totalUsers': {
            '$count': {}
          }
        }
      }
    ]

    let cachedResponse = await getCachedData("userDetails")
    let userData = cachedResponse

    if(!cachedResponse){

      userData = await userFeedingSchema.aggregate(usersAggregate)
      let totalUserData = await userFeedingSchema.aggregate(totalUsersAggregate)
      
      for(i=0; i<userData.length; i++){
        userData[i]["totalUsers"] = totalUserData[0]["totalUsers"]
      }
      
      await setCacheData("userDetails", userData, 3600)     
    }

    let newUserAlert = await utilsSchema.find({}).select({_id: 0, newStudentAlert: 1})
    return res.status(200).send({status: true, message: "Successfull", userData, newUserAlert})
      

})

exports.getTransactionsDetails = catchAsync(async(req, res, next) => {

  let restaurantData = await restaurantTransactionsSchema.find({disabled: false})
  let {totalAmountSpent, totalTransactions, totalDisbursedAmount, numberOfUsers, students, nonStudents, newStudentAlert} = await utilsSchema.findOne({ _id: "6283ecbcffda06c1fd477266" })
  let transactionData = {totalAmountSpent, totalTransactions, totalDisbursedAmount, numberOfUsers, students, nonStudents, newStudentAlert}


  return res.status(200).send({status: true, message: "Succssful", restaurantData, transactoinsData: transactionData})
})

exports.getDisbursementDetails = catchAsync(async(req, res, next) => {

  let disbursementAggregate = [
    {
      '$match': {
        'numOfTimesFunded': {
          '$gt': 0
        }
      }
    }, {
      '$group': {
        '_id': null, 
        'totalAmount': {
          '$sum': '$totalAmountFunded'
        }
      }
    }
  ]

  let cachedResponse = await getCachedData("disbursementDetails")
  let disbursementData = cachedResponse

  if(!cachedResponse){
    disbursementData = await userFeedingSchema.aggregate(disbursementAggregate)
    
    await setCacheData("disbursementDetails", disbursementData, 3600)

  }

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

exports.approveTempoararyTransactions = catchAsync(async(req, res, next) => {
  let {restaurantId} = req.body

  let tempoararyTransactionAggregate = [
    {
      '$match': {
        'disabled': false,
        'to': restaurantId
      }
    }, {
      '$group': {
        '_id': '$from', 
        'deficit': {
          '$sum': '$amount'
        }
      }
    }
  ]

  let userDetails = await tempoararyTransactionsSchema.aggregate(tempoararyTransactionAggregate)
  await tempoararyTransactionsSchema.updateMany({to: restaurantId}, {$set: {disabled: true}})

  userDetails.forEach( catchAsync(async(result) => {
    let user = await userFeedingSchema.findOneAndUpdate(
      {userId: result["_id"]},
      [
        {
          $set:{
            "previousBalance": "$balance",
            "balance": {$subtract: ["$balance", result.deficit]}
          }
        }
      ],
      {multi: true}
    )
  }))

  let restaurantDetails = await restaurantTransactionsSchema.findOneAndUpdate({restaurantId: restaurantId}, 
    [
      {
        $set:{
          "totalTransactions": {$add: ["$totalTransactions", "$manualTransactions"]},
          "totalTransactionsAmount": {$add: ["$totalTransactionsAmount", "$manualTransactionsAmount"]}
        }
      }
    ],
    {multi: true, new: true}
  )
  await restaurantSchema.findByIdAndUpdate(restaurantId, 
    [
      {$set: {
          "previousBalance": "$balance",
          "balance": {$add: ["$balance", "$manualTransactionsAmount"]},
          "manualTransactions": 0,
          "manualTransactionsAmount": 0
          },
      }
    ], 
    {multi: true}
  )

  await restaurantSchema.findByIdAndUpdate(restaurantId, 
    {
      $pull: {
        permissions: "simulate transactions"
      }
    }
   )

  res.status(200).send({status: true, message:"Transactions Approved"})
})

exports.endSession = catchAsync(async(req, res, next) => {
  let userId = req.user["_id"].toString()
  const socket = req.app.get("socket");
  try{
    let restaurantAggregate = [
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
          }, 
          'first': {
            '$first': '$$ROOT.createdAt'
          }, 
          'last': {
            '$last': '$$ROOT.createdAt'
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
          }, 
          'first': {
            '$first': '$first'
          }, 
          'last': {
            '$first': '$last'
          }
        }
      }
    ]
  
    let disbursementAggregate = [
      {
        '$group': {
          '_id': 0, 
          'totalAmount': {
            '$sum': '$amount'
          }
        }
      }, {
        '$project': {
          '_id': 0
        }
      }
    ]
  
    let studentAggregate = [
      {
        '$match': {
          'studentStatus': true
        }
      }, {
        '$group': {
          '_id': null, 
          'totalStudents': {
            '$count': {}
          }
        }
      }
    ]
   
    let userData = await userSchema.aggregate(studentAggregate)
  
    let disbursementData = await disbursementSchema.aggregate(disbursementAggregate)
  
    let transactionDetails = await transactionSchema.aggregate(restaurantAggregate)
    console.log(transactionDetails)
    if(transactionDetails.length === 0){
      return res.status(400).send({status: false, message:"No Transactions Within This Period"})
    }

    let from = moment(transactionDetails[0].last, "YYYY-MM-DD")
    let to = moment(transactionDetails[0].first, "YYYY-MM-DD")
  
    let duration = Math.round(moment.duration(from.diff(to)).asDays())
  
    let restaurantTransactions = []
  
    for(i=0; i<transactionDetails.length; i++){
      restaurantTransactions.push({
        "transactions": transactionDetails[i].transactions,
        "amount": transactionDetails[i].amount,
        "restaurantName": transactionDetails[i].restaurantName,
      })
    }
  
    let constructor = {
      name: req.body.name,
      numberOfStudents: userData[0].totalStudents,
      amountDisbursed: disbursementData[0].totalAmount,
      amountSpent: transactionDetails[0].totalAmount,
      totalTransactions: transactionDetails[0].totalTransactions,
      restaurants : restaurantTransactions,
      from: transactionDetails[0].first,
      to: transactionDetails[0].last,
      days: duration
    }  
  
    let records = await recordsSchema.create(constructor)
  
    let userUpdate = userSchema.updateMany({}, {$set: {studentStatus: false}})
    let feedingUpdate = userFeedingSchema.updateMany({}, {$set: {feedingType: 2, studentStatus: false, totalAmountFunded: 0, totalFeedingAmount: 0, fundingStatus: false, balance: 0, previousBalance: 0, amountLeft: 0, numOfTimesFunded: 0 }})
    let newStudentAlert = utilsSchema.updateMany({}, {$set: {newStudentAlert: 0}})
    let restaurants = restaurantSchema.updateMany({}, {$set: {balance: 0, previousBalance: 0}})
    await mongoose.connection.db.dropCollection("transactions")
    await mongoose.connection.db.dropCollection("disbursements")
    let promises = [userUpdate, feedingUpdate, newStudentAlert, restaurants]
  
    Promise.all(promises).then(results => {
      res.status(200).send({status: true, message:"Session Ended", data: records})
      return success(userId, ` ended the session`, "Update", socket)
    })
  }
  catch(err){
    console.log(err)
    res.status(400).send({status: false, message: err.message})
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

exports.exportCSV = catchAsync(async(req, res, next) => {
  if (!(req.body.from) || !(req.body.to)){
    return next (new AppError("Some required parameters are missing", 400))
  }
  let restaurantId = req.body.restaurantId ? req.body.restaurantId : null

  let userId = req.body.userId ? req.body.userId : null

  let workerData =  {from: req.body.from, to: req.body.to, restaurantId: restaurantId, userId: userId, type: "normal"}

  let thread = path.resolve(__dirname, "threads", "exportCSV.js")

  const worker = new Worker(thread);
  worker.on("message", (response) => {
    res.status(response.status).send(response.body)
  })

  worker.on("error", err => {
      return next (new AppError(err.message, 500))
  });

  worker.on("exit", exitCode => {
    return next (new AppError(exitCode, 500))
  })

  worker.postMessage(workerData);

})

exports.exportTemporaryTransations = catchAsync(async(req, res, next) => {
  let restaurantId = req.body.restaurantId ? req.body.restaurantId : null

  let userId = req.body.userId ? req.body.userId : null

  let workerData =  {restaurantId: restaurantId, userId: userId, type: "simulated"}

  let thread = path.resolve(__dirname, "threads", "exportCSV.js")

  const worker = new Worker(thread);
  worker.on("message", (response) => {
    res.status(response.status).send(response.body)
  })

  worker.on("error", err => {
      return next (new AppError(err.message, 500))
  });

  worker.on("exit", exitCode => {
    return next (new AppError(exitCode, 500))
  })

  worker.postMessage(workerData);
})

exports.resetStudentPin = catchAsync(async(req, res, next) => {
    
  let {newTransactionPin, userId} = req.body

  newTransactionPin = bcrypt.hashSync(newTransactionPin, 10)

  await userFeedingSchema.findOneAndUpdate({userId: userId}, {transactionPin: newTransactionPin}, {new: true})

  res.status(200).send({status: true, message: "Successful"})
})

exports.resetStudentPassword = catchAsync(async(req, res, next) => {
    
  let {userId, newPassword} = req.body

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await userSchema.findOneAndUpdate({_id: userId}, {password: hashedPassword})

  res.status(200).send({status: true, message: "Password Set Successfully"})
})

