const jwt = require("jsonwebtoken");
const config = process.env;
const {userFeedingSchema, utilsSchema} = require("../models/mainModel")

const fundingStatus = async(req, res, next) => {
    const token = req.headers["authorization"]
    
    let utils = await utilsSchema.findById("6283ecbcffda06c1fd477266")
    let status = isExpiryDate(new Date, utils.fundDate)
    console.log(status)
    if(status){
        userFeedingSchema.updateMany({}, {$set: {fundingStatus: false}})
    }
    return next()

}

function isExpiryDate(date, fundDate) {
    
    return new Date(date.getTime()).getDate() === fundDate;
}

module.exports.fundingStatus = fundingStatus
