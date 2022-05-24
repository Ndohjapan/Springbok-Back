const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const mongoosePaginate = require("mongoose-paginate-v2")

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
        },
        lastFunding: {
            type: Date,
            default: new Date().toISOString()
        },
        studentStatus: {
            type: Boolean,
            default: false
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
userFeedingSchema.plugin(mongoosePaginate)
disbursementSchema.plugin(mongoosePaginate)
module.exports.userFeedingSchema = mongoose.model("user-feeding", userFeedingSchema);
module.exports.disbursementSchema = mongoose.model("disbursement", disbursementSchema);