const {utilsSchema} = require("../../models/mainModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const {success} = require("../../utils/activityLogs")
    

exports.getUtils = catchAsync(async (req, res, next) => {
    const utils = await utilsSchema.find({});
    return res.status(200).send({ status: true, message: "Successful", data: utils[0] });
});

exports.updateUtils = catchAsync(async (req, res, next) => {
    const socket = req.app.get("socket");
    let userId = req.user["_id"].toString()

    let data = req.body;
    let updateData = {};

        let activityMessage = []
        

    Object.entries(data).forEach(([key, value]) => {
        if (value != "") {
            updateData[key] = value;
            activityMessage.push(key)
        }
    });

    activityMessage = activityMessage.join(", ")

    try{
        let utils = await utilsSchema.findOneAndUpdate({ _id: "6283ecbcffda06c1fd477266" },updateData,{ new: true });
        res.status(200).send({ status: true, message: "Utils Updated", data: utils });

        success(userId, ` updated : ${activityMessage}`, "Update", socket)

    }catch(err){
        console.log(err)
        res.status(400).send({ status: false, message: "Error In Update"});  
    }

});


exports.getAllLevels = catchAsync(async(req, res, next) => {
    let utils = await utilsSchema.find({})
  
    return res.status(200).send({status: true, message: "Successful", levels: utils[0].levels})
  
  })


exports.getAllHostels = catchAsync(async(req, res, next) => {
    let utils = await utilsSchema.find({})
  
    return res.status(200).send({status: true, message: "Successful", hostels: utils[0].hostels})
  
  })
