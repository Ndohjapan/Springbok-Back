const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    
        orderId: {
            type: String,
            unique: true
        },
        restaurant: {
            type: String,
            ref: "Restaurants"
        },
        createdBy: {
            type: String,
            ref: "user"
        },
        totalAmount:{
            type: Number
        },
        food: [{
            food: {type: String, ref: 'Food'},
            amount: {
                type: Number
            }
        }],
        status: {
            type: String,
            enum: ["recieved", "sent", "completed", "processing"]
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);