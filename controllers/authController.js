const config = require("config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const {userFeedingSchema} = require("../models/userFeedingModel");
const AppError = require("../utils/appError");
const generateOtp = require("../utils/generateOtp");
const sendMail = require("../utils/sendMail");
const dates = require("../utils/dates");
const catchAsync = require("../utils/catchAsync");

exports.signup = catchAsync(async (req, res, next) => {
  const { firstname, lastname, email, password, department, level, hostel, transactionPin, matricNumber } = req.body;

  if (await User.findOne({ email }))
    return next(new AppError("User already exists", 400));

  const otp = generateOtp();
  const otpExpiresIn = dates.getFutureMinutes(config.get("otpMinutesLimit"));

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const hashedPin = await bcrypt.hash(transactionPin, salt)

  const user = await User.create({
    firstname,
    lastname,
    email,
    otp,
    otpExpiresIn,
    password: hashedPassword,
    department,
    level,
    hostel,
    matricNumber
  });
  await userFeedingSchema.create({userId: user["_id"].toString(), transactionPin: hashedPin })
  const token = await user.generateAuthToken();
  await sendMail(email, otp);

  res.status(201).json({ status: true, data: user, token });
});

exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("Provide an email and password", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));

  const correctPassword = await user.checkPassword(password);
  if (!correctPassword)
    return next(new AppError("Incorrect email or password", 400));

  const token = await user.generateAuthToken();
  res.status(200).json({ status: true, token, payload: user });
});

exports.verify = catchAsync(async (req, res, next) => {
  const { otp, userId } = req.body;

  const user = await User.findOne({ "_id": userId, otp: otp });
  if (!user) return next(new AppError("Otp is invalid", 400));

  const currentDate = Date.now();
  const elapsed = dates.minuteDifference(currentDate, user.otpExpiresIn);

  if (elapsed > config.get("otpMinutesLimit"))
    return next(new AppError("OTP expired", 400));

  user.otp = "";
  user.otpExpiresIn = null;
  user.verified = true;
  await user.save();

  res.status(200).json({ status: true, data: user });
});

exports.resendOtp = catchAsync(async (req, res, next) => {
  if (req.user.verified)
    return next(new AppError("user already verified", 400));

  const otp = generateOtp();
  const otpExpiresIn = dates.getFutureMinutes(config.get("otpMinutesLimit"));

  await User.findByIdAndUpdate(req.user._id, { otp, otpExpiresIn });
  await sendMail(req.user.email, otp);

  res.status(200).json({ status: true, data: "OTP re-sent" });
});

exports.restrictTo = (...roles) => {
  return catchAsync((req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    next();
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token = req.header("x-auth-token");
  if (!token) return next(new AppError("No Token Given", 401));

  const decoded = jwt.verify(token, config.get("jwtPrivateKey"));

  req.user = await User.findById(decoded.id);
  next();
});
