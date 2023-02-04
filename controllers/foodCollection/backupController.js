const {Worker} = require("worker_threads")
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const {restaurantSchema, backupSchema, apiKeySchema} = require("../../models/mainModel")
const {uploadBackup} = require("./threads/backupCSV")
const path = require("path");
const { getFilesInFolder } = require("../document");
const date = new Date();

const padWithZero = (num) => {
    return num < 10 ? '0' + num : num;
};

const replaceSpacesWithDashes = (str) => {
    str = str.replace(/&/g, 'and')
    return str.replace(/\s/g, '-');
};


exports.dailyBackup = catchAsync(async(req, res, next) => {

    let restaurants = await restaurantSchema.find({})
      
    const year = date.getFullYear();
    const month = padWithZero(date.getMonth() + 1);
    const day = padWithZero(date.getDate());

    console.log(restaurants.length)
    
    let resultData = await performBackup(restaurants, year, month, day)
    
    let backUpData = await backupSchema.create({folder: `${year}-${month}-${day}`})
    
    res.send({success: true, data: backUpData})
})

exports.getBackupFiles = catchAsync(async(req, res, next) => {
    let {folder} = req.body

    let result = await getFilesInFolder(folder)

    res.send({success: true, data: result})
})

exports.getALlFolders = catchAsync(async(req, res, next) => {
    let result = await backupSchema.find({})

    return res.send({success: true, data: result})
})

async function performBackup(restaurants, year, month, day){
    let resultData = []
    let i = 0
    while(i<restaurants.length){
        let data = {restaurantName: replaceSpacesWithDashes(restaurants[i].name), restaurantId: restaurants[i].id , year,  month, day}
        
        let result = await uploadBackup(data)
        resultData.push(result)
        
        i++
    }

    return resultData
}