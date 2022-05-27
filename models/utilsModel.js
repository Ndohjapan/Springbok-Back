const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const utilsSchema = new mongoose.Schema({
    fundDate: {
        type: Number,
        default: 27
    },

    feedingAmount: {
        type: Number,
        default: 15000
    }, 

    newStudentAlert:{
        type: Number, 
        default: 0
    }

}, {timestamps: true})


modules.exports.utilsSchema = mongoose.model("utils", utilsSchema);