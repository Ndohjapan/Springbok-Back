const Formidable = require("formidable");

const cloudinary = require("cloudinary").v2;
const AppError = require("../utils/appError");

const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/activityLogs");

const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: "./config/config.env" });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const fs = require("fs");
const AWS = require("aws-sdk");
const { resolve } = require("path");

const s3 = new AWS.S3({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
});

const fileName = "contacts.csv";

const uploadFile = () => {
  fs.readFile(fileName, (err, data) => {
    if (err) throw err;
  });
};

exports.uploadDocument = catchAsync(async (req, res, next) => {
  const form = Formidable();

  form.parse(req, async (err, fields, files) => {
    const fileName = randomFilename(
      files.document.newFilename,
      files.document.originalFilename
    );

    try {
      const result = await cloudinary.uploader.upload(files.document.filepath, {
        public_id: fileName,
        folder: "profile",
      });

      return res.status(200).send({ status: true, url: result.secure_url });
    } catch (error) {
      console.log(error);
      return next(new AppError("Error in uploading file", 500));
    }
  });
});

exports.uploadFile = async (fileName) => {
  return new Promise(async (resolve, reject) => {
    let filePath;

    if (process.env.NODE_ENV === "test") {
        filePath = path.join(__dirname, "..", "__test__", "resources", fileName);
    }
    else{
        filePath = path.join(__dirname, "..", fileName);
    }

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "raw",
        public_id: fileName,
        folder: "transactions-summary",
      });

      resolve({ status: 200, body: { success: true, url: result.secure_url } });
    } catch (error) {
      console.log(error);
      resolve({
        status: 400,
        body: { success: false, message: "Error in uploading file" },
      });
    }
  });
};

exports.uploadBackup = async (fileName, folder) => {
  console.log(fileName, folder);

  const file = fileName;
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload(fileName, {
        resource_type: "raw",
        folder: folder,
        public_id: fileName,
      })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

exports.getFilesInFolder = async (folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.api.resources(
      { type: "upload", resource_type: "raw", prefix: folder },
      (error, result) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          const resources = result.resources;
          resolve(
            resources.map(({ public_id, secure_url }) => ({
              public_id,
              secure_url,
            }))
          );
        }
      }
    );
  });
};

function randomFilename(newFileName, mimetype) {
  mimetype = mimetype.split(".");
  let ext =
    mimetype[mimetype.length - 1] === "*"
      ? "png"
      : mimetype[mimetype.length - 1];
  ext = ext.replace(/^\W|\W*$/gm, "");
  newFileName = `${Date.now()}.${ext}`;

  return newFileName;
}
