const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2")

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    servedWith: {
      type: String,
    },
    createdBy: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
    },
    tags: {
      type: [{type: String, enum: ["snacks", "food", "drinks", "protein", "others"]}],
      required: true
    }
  },
  { timestamps: true }
);

foodSchema.plugin(mongoosePaginate)

module.exports = mongoose.model("Food", foodSchema);
