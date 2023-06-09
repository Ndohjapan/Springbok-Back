const Redis = require("ioredis");
const config = require("config");

const { HOST, PASSWORD, PORT } = config.get("redis");

async function getCachedData(key, page = 0, limit = 0) {
  let redisClient = await connectToRedis();
  let cachedResponse = await redisClient.get(key);

  redisClient.quit();

  if (page > 0 && cachedResponse) {
    let jsonResponse = JSON.parse(cachedResponse);

    if (jsonResponse.docs) {
      jsonResponse.docs = jsonResponse.docs.slice(
        (page - 1) * limit,
        (page - 1) * limit + limit
      );
      return jsonResponse;
    } else {
      return jsonResponse.slice((page - 1) * limit, (page - 1) * limit + limit);
    }
  }

  return JSON.parse(cachedResponse);
}

async function setCacheData(key, value, time) {
  value = JSON.stringify(value);

  let redisClient = await connectToRedis();

  const cachedData = await redisClient.set(key, value, "ex", time);

  redisClient.quit();

  return cachedData;
}

async function delcacheData(key) {
  let redisClient = await connectToRedis();

  const cachedData = await redisClient.del(key);

  redisClient.quit();

  return cachedData;
}

async function connectToRedis() {
  let redisClient;
  if (process.env.NODE_ENV !== "testing") {
    redisClient = Redis.createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
    });
  } else {
    redisClient = Redis.createClient({
      host: HOST,
      port: PORT,
    });
  }

  redisClient.on("connect", () => {
      if (process.env.NODE_ENV !== "testing") {
        console.log("connected to redis successfully!");
    }
  });

  redisClient.on("error", (error) => {
    console.log("Redis connection error :", error);
  });

  redisClient.on("exit", () => {
    console.log("Redis disconnected");
  });

  return redisClient;
}

exports.getCachedData = getCachedData;
exports.setCacheData = setCacheData;
exports.delcacheData = delcacheData;
