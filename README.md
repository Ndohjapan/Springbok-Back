# Springbok-Back

## Getting Started

### Clone this repo

~~~
git clone https://github.com/Ndohjapan/Springbok-Back.git
~~~

### Navigate into the folder

~~~
cd Springbok-Back
~~~

### Create Some 3rd Party Account
1. Cloudinary (This is for the image upload and daily transaction backup)
2. Postmark (This handles email sending)
3. Create a Mongodb Atlas Account or you can use localhost mongodb
4. Create a Redis Account on http://redis.com/try-free
5. Create a Treblle Account (This handles API monitoring and observability)
### Create The ENV file

1. Navigate to the configs folder
2. Create a file named `.env`
3. Fill in with the necessary information

~~~
accessKeyId=
CLOUD_NAME=
CLOUDINARY_KEY=
CLOUDINARY_SECRET=
jwtPrivateKey=
mongoDbUrl=
otpMinutesLimit=
postmarkKey=
REDISCLOUD_URL=
REDIS_ENDPOINT_URI=
REDIS_HOST=
REDIS_PASSWORD=
REDIS_USERNAME=
REDIS_PORT=
secretAccessKey=
senderEmail=
NODE_ENV=
PRODUCTION_ADMIN_EMAIL=
DEVELOPMENT_ADMIN_EMAIL =
TREBLLE_API_KEY =
TREBLLE_PROJECT_ID =
~~~

### Install Node Modules

~~~
npm install
~~~

### Start Application
~~~
npm run dev
~~~

## Run Test

### Download and Install Mongodb

Go to the official website for mongodb and downlaod it for your operating system

https://www.mongodb.com/try/download/community

### Use Docker to Start Redis on Port 6380
~~~
docker run -d -p 6380:6379 --name redis-container redis:latest
~~~

### Run Test Command
~~~
npm run test
~~~

