const Redis = require('ioredis');

async function getCachedData(key){

    let redisClient = await connectToRedis()
    
    const cachedResponse = await redisClient.get(key)

    redisClient.quit();

    return JSON.parse(cachedResponse)

}

async function setCacheData(key, value, time){

    value = JSON.stringify(value)

    let redisClient = await connectToRedis()

    const cachedData = await redisClient.set(key, value, "ex", time)

    redisClient.quit();

    return cachedData
}

async function connectToRedis(){
    const redisClient = Redis.createClient({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD
    });

    redisClient.on('connect',() => {
        console.log('connected to redis successfully!');
    })


    redisClient.on('error',(error) => {
        console.log('Redis connection error :', error);
    })

    redisClient.on("exit", () => {
        console.log("Redis disconnected")
    })

    return redisClient
}

exports.getCachedData = getCachedData
exports.setCacheData = setCacheData



