const express = require("express");
const { permissionTo, protect, apiKeyVerification, onlyAdmins } = require("../controllers/authController");
const router = express.Router();

const {dailyBackup, getBackupFiles, getALlFolders} = require("../controllers/foodCollection/backupController");



// Do the daily backup 
router
    .route("/")
    .get(apiKeyVerification, dailyBackup)

router
    .route("/getAllFolders")
    .get(protect, onlyAdmins, getALlFolders)    

router
    .route("/getFiles")
    .post(protect, permissionTo("view backup"), getBackupFiles)

// // delete any
// router
//     .route("/:id")
//     .delete(deleteActivity);

// // Get a single activity 
// router
//     .route("/getActivity/:id")
//     .get(getActivity)

module.exports = router;
