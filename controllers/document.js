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

exports.uploadDocument = catchAsync(async(req, res, next) => {
    
    const form = Formidable();

    form.parse(req, (err, fields, files) => {

        // console.log(files)
        const fileName = randomFilename(files["document"].newFilename, files["document"].originalFilename)

        cloudinary.uploader.upload((fileName, path.normalize(files["document"].filepath)), (result) => {

            
            // This will return the output after the code is exercuted both in the terminal and web browser
            // When successful, the output will consist of the metadata of the uploaded file one after the other. These include the name, type, size and many more.
            if (result.public_id) {
            
                // The results in the web browser will be returned inform of plain text formart. We shall use the util that we required at the top of this code to do this.
                return res.status(200).send({status: true, url: result.url})
            }

            return res.status(400).send({status: false})
        });
    });

})


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
  
