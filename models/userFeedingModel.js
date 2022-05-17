const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userFeedingSchema = new mongoose.Schema({
    
        userId: {
            type: String,
            unique: true,
            ref: "user"
        },
        transactionPin: {
            type: String
        },
        balance: {
            type: Number,
            default: 0
        },
        previousBalance: {
            type: Number,
            default: 0
        },
        fundingStatus: {
            type: Boolean,
            default: false
        },
        feedingType: {
            type: Number,
            default: 2
        }
    },
    { timestamps: true }
);

const disbursementSchema = new mongoose.Schema({
    amount: {
        type: Number,
        default: 0
    },

    numberOfStudents: {
        type: Number,
        default: 0
    }


}, {timestamps: true})

userFeedingSchema.methods.checkPin = function (transactionPin) {
    return bcrypt.compare(transactionPin, this.transactionPin);
};

module.exports.userFeedingSchema = mongoose.model("user-feeding", userFeedingSchema);
module.exports.disburementSchema = mongoose.model("disbursement", disbursementSchema);