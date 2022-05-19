const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("config");

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    picture: { type: String },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiresIn: { type: Date },
    role: {
      type: String,
      enum: ["user", "restaurantAdmin", "manager", "bursar", "dev"],
      default: "user",
    },
    department: {type: String},
    level: {type: String},
    hostel: {type: String},
    matricNumber: {type: String},
    studentStatus: {
      type: Boolean,
      default: false
    }, 
    status: {
      type: String,
      enum: ["blocked", "active"],
      default: "active"
    }
  },
  { timestamps: true }
);

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, verified: this.verified },
    config.get("jwtPrivateKey")
  );
};

userSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("user", userSchema);