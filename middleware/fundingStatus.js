const jwt = require("jsonwebtoken");
const moment = require("moment")
const config = process.env;
const {userFeedingSchema, utilsSchema} = require("../models/mainModel")

const fundingStatus = async(req, res, next) => {
    const token = req.headers["authorization"]
    await userFeedingSchema.updateMany({}, {$set: {lastFunding: moment("$lastFunding").format("YYYY-MM-DD")}})
    let thirtyDaysAgo = moment().subtract(30, "days").format("YYYY-MM-DD")
    await userFeedingSchema.updateMany({lastFunding: thirtyDaysAgo}, {$set: {fundingStatus: false}})
    return next()

}

module.exports.fundingStatus = fundingStatus
