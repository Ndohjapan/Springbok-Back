const jwt = require("jsonwebtoken");
const moment = require("moment")
const config = process.env;
const {userFeedingSchema, utilsSchema} = require("../models/mainModel")

const fundingStatus = async(req, res, next) => {
    const token = req.headers["authorization"]
    userFeedingSchema.find({userId: "62cbd67a4ff4bfba252a0a6c"}, async function(err, docs){
        if(err)return err
        console.log(docs)
        for(i=0; i<docs.length; i++){
            let lastFundingDay = docs[i].lastFundingDay
            console.log(lastFundingDay)
            lastFundingDay = moment(lastFundingDay).format("YYYY-MM-DD")
            console.log(lastFundingDay)
            
            await userFeedingSchema.updateMany({userId: docs[i].userId}, {$set: {lastFunding: lastFundingDay}})
    
        }
                
        return 0
    })
    let thirtyDaysAgo = moment().subtract(30, "days").format("YYYY-MM-DD")
    await userFeedingSchema.updateMany({lastFunding: thirtyDaysAgo}, {$set: {fundingStatus: false}})
    return next()

}

module.exports.fundingStatus = fundingStatus
