const redis = require("redis");
const client = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});
client.on('error', (err) => console.log('Redis Client Error', err));

async function getCachedData(key){
    let cachedData = client.get(key)

    console.log(cachedData)

    if(!cachedData){
        return false
    }
    return cachedData

}

exports.getCachedData = getCachedData
exports.client = client



