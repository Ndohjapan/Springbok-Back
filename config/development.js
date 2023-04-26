const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

module.exports = {
  database: {
    URL: process.env.mongoDbUrl,
  },
  redis: {
    CLOUD_URL: process.env.REDISCLOUD_URL,
    ENDPOINT_URI: process.env.REDIS_ENDPOINT_URI,
    HOST: process.env.REDIS_HOST,
    PASSWORD: process.env.REDIS_PASSWORD,
    USERNAME: process.env.REDIS_USERNAME,
    PORT: process.env.REDIS_PORT,
  },
  mail:{
    KEY: process.env.postmarkKey,
    SENDER_EMAIL: "support@lcufeeding.com"
  },
  cloudinary:{
    NAME: process.env.CLOUD_NAME,
    KEY: process.env.CLOUDINARY_KEY,
    SECRET: process.env.CLOUDINARY_SECRET
  },
  admin: {
    EMAIL: process.env.DEVELOPMENT_ADMIN_EMAIL
  },
  jwt:{
    KEY: process.env.jwtPrivateKey
  },
  otpMinutesLimit: "10"
};
