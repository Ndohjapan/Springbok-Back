module.exports = {
    database: {
      URL: "mongodb://localhost:27017/springbok",
    },
    redis: {
      CLOUD_URL: process.env.REDISCLOUD_URL,
      ENDPOINT_URI: process.env.REDIS_ENDPOINT_URI,
      HOST: "localhost",
      PASSWORD: "mypassword",
      PORT: "6380",
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
  