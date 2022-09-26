const jwt = require("jsonwebtoken");
const moment = require("moment")
const config = process.env;
const {userFeedingSchema, utilsSchema} = require("../models/mainModel")

const fundingStatus = async(req, res, next) => {
    const token = req.headers["authorization"]
    
    let thirtyDaysAgo = moment().subtract(30, "days").format("YYYY-MM-DD")
    console.log(thirtyDaysAgo)
    await userFeedingSchema.updateMany({lastFundingDay: thirtyDaysAgo}, {$set: {fundingStatus: false}})
    return next()

}

module.exports.fundingStatus = fundingStatus
