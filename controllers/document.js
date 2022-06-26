const Formidable = require('formidable');

const cloudinary = require("cloudinary");
const AppError = require("../utils/appError");

const catchAsync = require("../utils/catchAsync");
const {success} = require("../utils/activityLogs")

const dotenv = require("dotenv")
const path = require("path")
dotenv.config({path: "./config/config.env"})

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const fs = require('fs');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey
});

const fileName = 'contacts.csv';

const uploadFile = () => {
  fs.readFile(fileName, (err, data) => {
     if (err) throw err;
     
  });
};

exports.uploadDocument = catchAsync(async(req, res, next) => {
    
    const form = Formidable();

    form.parse(req, (err, fields, files) => {

        const fileName = randomFilename(files["document"].newFilename, files["document"].originalFilename)

        const fileStream = fs.createReadStream(path.normalize(files["document"].filepath))

        const uploadParams = {
            Bucket: "leadcity",
            Body: fileStream,
            Key: fileName
        }

        s3.upload(uploadParams, function(s3Err, data) {
            if (s3Err){
                
                return next (new AppError(s3Err.message, 403))
            } 
            console.log(`File uploaded successfully at ${data}`)
            return res.status(200).send({status: true, url: data.Location})
    
        });
        

    });

})

exports.uploadFile = async(fileName) => {
    return new Promise((resolve, reject) => {

        let filePath = path.join(__dirname, "..", fileName)

        const fileStream = fs.createReadStream(filePath)

        const uploadParams = {
            Bucket: "leadcity",
            Body: fileStream,
            Key: fileName
        }

        s3.upload(uploadParams, function(s3Err, data) {
            if (s3Err){
                
                resolve( {status: 400, body: {success: false, message: s3Err.message}})

            } 
            console.log(`File uploaded successfully at ${data}`)
            resolve( {status: 200, body: {success: true, url:data.Location}})
    
        });
    })
}

function randomFilename(newFileName, mimetype){
    mimetype = mimetype.split(".")
    let ext = mimetype[mimetype.length - 1] === "*" ? "png" : mimetype[mimetype.length -1] 
    ext = ext.replace(/^\W|\W*$/gm, "")
    console.log(mimetype)
    console.log(newFileName, ext)
    newFileName = `${Date.now()}.${ext}`
    console.log(newFileName)

    return newFileName
}
  
