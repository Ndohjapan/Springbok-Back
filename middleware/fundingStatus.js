const jwt = require("jsonwebtoken");
const moment = require("moment")
const config = process.env;
const {userFeedingSchema, utilsSchema} = require("../models/mainModel")

const fundingStatus = async(req, res, next) => {
    const token = req.headers["authorization"]
    userFeedingSchema.find({userId: "62cbd67a4ff4bfba252a0a6c"}, async function(err, docs){
        if(err)return err
        console.log(docs)
        let lastFundingDay = docs.lastFundingDay
        lastFundingDay = moment(lastFundingDay).format("YYYY-MM-DD")
        
        return await userFeedingSchema.updateMany({userId: docs.userId}, {$set: {lastFunding: lastFundingDay}})
        
    })
    let thirtyDaysAgo = moment().subtract(30, "days").format("YYYY-MM-DD")
    await userFeedingSchema.updateMany({lastFunding: thirtyDaysAgo}, {$set: {fundingStatus: false}})
    return next()

}

module.exports.fundingStatus = fundingStatus
