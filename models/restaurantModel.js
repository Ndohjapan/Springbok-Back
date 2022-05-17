const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    numberOfFood: {
      type: Number,
      default: 0,
    },
    logo: {
      type: String,
      default:
        "https://res.cloudinary.com/billingshq/image/upload/v1646363586/springsbok/restaurant_qzb7vt.png",
    },
    balance: {
      type: Number,
      default: 0
    }, 
    previousBalance: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number
  },
  from:{
    type: String,
    ref: "user"
  },
  to: {
    type: String,
    ref: "Restaurants"
  }
}, {timestamps: true})

module.exports.restaurantSchema = mongoose.model("Restaurants", restaurantSchema);
module.exports.transactionSchema = mongoose.model("transactions", transactionSchema)