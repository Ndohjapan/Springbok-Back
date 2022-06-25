const express = require("express");
const router = express.Router();
const {uploadDocument} = require("../controllers/document");

router.post("/uploadDocument", uploadDocument);


module.exports = router;