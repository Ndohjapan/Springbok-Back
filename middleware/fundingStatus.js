const jwt = require("jsonwebtoken");
const moment = require("moment")
const config = process.env;
const {userFeedingSchema, utilsSchema} = require("../models/mainModel")

const fundingStatus = async(req, res, next) => {
    const token = req.headers["authorization"]
    userFeedingSchema.find({}, async function(err, docs){
        if(err){
            return err
        }
        for(i=0; i<docs.length; i++){
            try{
                console.log(docs[i].userId)
                let lastFundingDay = docs[i].lastFundingDay
                lastFundingDay = new Date(lastFundingDay).toISOString().substring(0, 10)

                await userFeedingSchema.updateMany({userId: docs[i].userId}, {$set: {lastFunding: lastFundingDay}})
            }
            catch(err){
                console.log(err)
                continue;
            }

    
        }
                
        return 0
    })
    let thirtyDaysAgo = moment().subtract(30, "days").format("YYYY-MM-DD")
    await userFeedingSchema.updateMany({lastFunding: thirtyDaysAgo}, {$set: {fundingStatus: false}})
    return next()

}

module.exports.fundingStatus = fundingStatus
