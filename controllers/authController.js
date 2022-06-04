const config = require("config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {userFeedingSchema, utilsSchema, userSchema, adminSchema, restaurantSchema} = require("../models/mainModel");
const AppError = require("../utils/appError");
const generateOtp = require("../utils/generateOtp");
const sendMail = require("../utils/sendMail");
const dates = require("../utils/dates");
const catchAsync = require("../utils/catchAsync");
const {success} = require("../utils/activityLogs")

exports.signup = catchAsync(async (req, res, next) => {
  const { firstname, lastname, email, password, department, level, hostel, transactionPin, matricNumber } = req.body;

  if (await userSchema.findOne({ email }))
    return next(new AppError("User already exists", 400));

  const otp = generateOtp();
  const otpExpiresIn = dates.getFutureMinutes(config.get("otpMinutesLimit"));

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const hashedPin = await bcrypt.hash(transactionPin, salt)

  const user = await userSchema.create({
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
  await userFeedingSchema.create({userId: user["_id"].toString(), transactionPin: hashedPin, totalAmountFunded: 0, numOfTimesFunded: 0, amountLeft: 0, amountLeft: 0 })
  const token = await user.generateAuthToken();
  await sendMail(email, otp);

  res.status(201).json({ status: true, data: user, token });

  await utilsSchema.updateMany({}, {$inc: {newStudentAlert: 1}})

});

exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("Provide an email and password", 400));

  const user = await userSchema.findOne({ email });
  if (!user){
    return next(new AppError("User not found", 404));
  }
  else{

    const correctPassword = await user.checkPassword(password);
    if (!correctPassword){

      return next(new AppError("Incorrect email or password", 400));
    }else{
      const token = await user.generateAuthToken();
      res.status(200).json({ status: true, token, payload: user });
    }

  } 

});

exports.adminSignup = catchAsync(async (req, res, next) => {

  const socket = req.app.get("socket");
  let userId = req.user["_id"].toString()

  const { firstname, lastname, email, password, number, role } = req.body;

  if (await adminSchema.findOne({ email }))
    return next(new AppError("User already exists", 400));

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await adminSchema.create({
    firstname,
    lastname,
    email,
    password: hashedPassword,
    number, role
  });

  const token = await user.generateAuthToken();

  res.status(201).json({ status: true, data: user, token });

  return success(userId, ` added ${user.firstname} ${user.lastname} as an admin`, socket)


});

exports.adminSignin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("Provide an email and password", 400));

  const user = await adminSchema.findOne({ email });
  if (!user){
    return next(new AppError("User not found", 404));
  }
  else{

    const correctPassword = await user.checkPassword(password);
    if (!correctPassword){

      return next(new AppError("Incorrect email or password", 400));
    }else{
      const token = await user.generateAuthToken();
      res.status(200).json({ status: true, token, payload: user });
    }

  } 

});

exports.restaurantSignin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("Provide an email and password", 400));

  const restaurant = await restaurantSchema.findOne({ email });
  if (!restaurant){
    return next(new AppError("Restaurant not found", 404));
  }
  else{

    const correctPassword = await restaurant.checkPassword(password);
    if (!correctPassword){

      return next(new AppError("Incorrect email or password", 400));
    }else{
      const token = await restaurant.generateAuthToken();
      res.status(200).json({ status: true, token, payload: restaurant });
    }

  } 

});

exports.verify = catchAsync(async (req, res, next) => {
  const { otp, email } = req.body;

  let user = await userSchema.findOne({ email: email, otp: otp });
  if (!user) return next(new AppError("Otp is invalid", 400));

  const currentDate = Date.now();
  const elapsed = dates.minuteDifference(currentDate, user.otpExpiresIn);

  if (elapsed > config.get("otpMinutesLimit")){
    return next(new AppError("OTP expired", 400));
  }else{
    
    user = await userSchema.findOneAndUpdate({email:email}, {$set: {otp:"", verified: true, otpExpiresIn: null}}, {new: true})
  
    res.status(200).json({ status: true, data: user });
  }
});

exports.resendOtp = catchAsync(async (req, res, next) => {
  if (req.user.verified)
    return next(new AppError("user already verified", 400));

  const otp = generateOtp();
  const otpExpiresIn = dates.getFutureMinutes(config.get("otpMinutesLimit"));

  await userSchema.findByIdAndUpdate(req.user._id, { otp, otpExpiresIn });
  await sendMail(req.user.email, otp);

  res.status(200).json({ status: true, data: "OTP re-sent" });
});


exports.sendUserOTP = catchAsync(async(req, res, next) => {
  let {email} = req.body

  let user = await userSchema.findOne({email: email})

  if(user.email){
    const otp = generateOtp();
    const otpExpiresIn = dates.getFutureMinutes(config.get("otpMinutesLimit"));

    await userSchema.findOneAndUpdate({email:email}, {$set: {otp:otp, otpExpiresIn: otpExpiresIn}}, {new: true})

    await sendMail(email, otp)
    res.status(200).send({status: true, message: "Email Sent"})

  }else{
    return next(new AppError("User does not exist", 400));
    
  }

})

exports.resetPassword = catchAsync(async(req, res, next) => {
  let {email, newPassword} = req.body

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await userSchema.findOneAndUpdate({email: email}, {password: hashedPassword})

  res.status(200).send({status: true, message: "Password Set Successfully"})

})

exports.permissionTo = (...roles) => {
  return catchAsync((req, res, next) => {
    if(req.user.role === "bursar"){
      next()
    }
    else{
      let userPermissions = req.user.permissions
      let permission = userPermissions.join().includes(roles.join())
      if (!permission)
        return next(
          new AppError("You do not have permission to perform this action", 403)
        );
      next();
    }
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token = req.header("x-auth-token");
  if(!token){
    return res.status(403).send({success: false, message: "Unauthorized"})
  }
  
  try{
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"))
    req.user = await userSchema.findById(decoded.id);
    if(req.user){
      return next()
    }
    else{
      req.user = await adminSchema.findById(decoded.id)
      req.user = req.user ? req.user : await restaurantSchema.findById(decoded.id)
      return next()
    }
  }
  catch(err){
    return res.status(401).send({success: false, message: "Invalid Token"})
  }
});
