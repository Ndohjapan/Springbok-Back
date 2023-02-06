const dotenv = require("dotenv")
dotenv.config({path: "./config/config.env"})
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {userFeedingSchema, utilsSchema, userSchema, adminSchema, restaurantSchema, apiKeySchema} = require("../models/mainModel");
const AppError = require("../utils/appError");
const generateOtp = require("../utils/generateOtp");
const {sendMail} = require("../utils/sendMail");
const dates = require("../utils/dates");
const catchAsync = require("../utils/catchAsync");
const {success} = require("../utils/activityLogs")

async function validateSignUpData(data){
  let utils = await utilsSchema.find({})

  let {departments, levels, hostels} = utils[0]

  if(departments.includes(data.department) && levels.includes(data.level) && hostels.includes(data.hostel)){
    return true
  }

  return false
}

exports.signup = catchAsync(async (req, res, next) => {

  if(!await validateSignUpData(req.body)){
    return next(new AppError("Invalid Signup", 400))
  }

  const { firstname, lastname, middlename, email, password, department, level, hostel, transactionPin, matricNumber } = req.body;

  

  if (await userSchema.findOne({ email }))
    return next(new AppError("User already exists", 400));

  const otp = generateOtp();
  const otpExpiresIn = dates.getFutureMinutes(process.env.otpMinutesLimit);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const hashedPin = await bcrypt.hash(transactionPin, salt)

  let user = await userSchema.create({
    firstname,
    lastname,
    middlename,
    email,
    otp,
    otpExpiresIn,
    password: hashedPassword,
    department,
    level,
    hostel,
    matricNumber
  });

  user.otp = "";
  user.otpExpiresIn = "";

  await userFeedingSchema.create({userId: user["_id"].toString(), transactionPin: hashedPin, totalAmountFunded: 0, numOfTimesFunded: 0, amountLeft: 0, amountLeft: 0 })
  const token = await user.generateAuthToken();
  await sendMail(email, otp);

  res.status(201).json({ status: true, data: user, token });

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

  const { firstname, lastname, email, password, number, role, permissions } = req.body;

  if (await adminSchema.findOne({ email }))
    return next(new AppError("User already exists", 400));

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  try{

    const user = await adminSchema.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      number, role, permissions
    });
  
    const token = await user.generateAuthToken();
  
    res.status(201).json({ status: true, data: user, token });
  
    return success(userId, ` added ${user.firstname} ${user.lastname} as an admin`, "Create", socket)
  }
  catch(err){
    return res.status(400).send({status:false, message: err.message})
  }


});

exports.adminSignin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const socket = req.app.get("socket");

  if (!email || !password)
    return next(new AppError("Provide an email and password", 400));

    const user = await adminSchema.findOne({ email });
    if (!user){
      return next(new AppError("Invalid Login", 404));
    }
    else{
      
      let userId = user["_id"].toString()
      const correctPassword = await user.checkPassword(password);
      if (!correctPassword){

        return next(new AppError("Incorrect email or password", 400));
      }else{
        const token = await user.generateAuthToken();
        res.status(200).json({ status: true, token, payload: user });

        return success(userId, ` just logged on to admin dashboard`, "Login", socket)

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

  if (elapsed > process.env.otpMinutesLimit){
    return next(new AppError("OTP expired", 400));
  }else{
    
    user = await userSchema.findOneAndUpdate({email:email}, {$set: {otp:"", verified: true, otpExpiresIn: null}}, {new: true})
    
    res.status(200).json({ status: true, data: user });
    
    await utilsSchema.updateMany({}, {$inc: {newStudentAlert: 1, numberOfUsers: 1, nonStudents: 1}})
  
    return await setCacheData("allUsers", "", 10)
  }
});

exports.resendOtp = catchAsync(async (req, res, next) => {
  if (req.user.verified)
    return next(new AppError("user already verified", 400));

  const otp = generateOtp();
  const otpExpiresIn = dates.getFutureMinutes(process.env.otpMinutesLimit);

  await userSchema.findByIdAndUpdate(req.user._id, { otp, otpExpiresIn });
  await sendMail(req.user.email, otp);

  res.status(200).json({ status: true, data: "OTP re-sent" });
});


exports.sendUserOTP = catchAsync(async(req, res, next) => {
  let {email} = req.body

  let user = await userSchema.findOne({email: email})

  if(user){
    const otp = generateOtp();
    const otpExpiresIn = dates.getFutureMinutes(process.env.otpMinutesLimit);

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
  return ((req, res, next) => {    
    if(req.user.role === "bursar"){
      if(process.env.NODE_ENV === "production"){
        if(req.user.email === process.env.PRODUCTION_ADMIN_EMAIL || req.user.email === process.env.DEVELOPMENT_ADMIN_EMAIL){
          next()
        }
        else{
          return next(
            new AppError("You do not have permission to perform this action", 403)
          )
        }
      }
      else{
        next()
      }
    }
    else{
      let userPermissions = req.user.permissions
      try {
        let permission = userPermissions.join().includes(roles.join())
        if (!permission){
          return next(
            new AppError("You do not have permission to perform this action", 403)
          );
        }
        next();
        
      } catch (error) {
        return next(
          new AppError("You do not have permission to perform this action", 403)
        );
      }
    }
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token = req.header("x-auth-token");
  if(!token){
    return res.status(401).send({success: false, message: "Invalid Token"})
  }
  
  try{
    const decoded = jwt.verify(token, process.env.jwtPrivateKey)
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

exports.onlyAdmins = catchAsync(async(req, res, next) => {
  const admin = await adminSchema.findById(req.user.id)
  if(admin){
    return next()
  }
  return next(new AppError("You do not permission to perform this action", 403))
})

exports.apiKeyVerification = catchAsync(async (req, res, next) => {
  let accessKey = req.header("x-auth-accessKey")
  let secretKey = req.header("x-auth-secretKey")

  const decoded = await apiKeySchema.findOne({apiAccessKey: accessKey, apiSecretKey: secretKey})

  if(decoded){
    return next()
  }
  else{
    return next(new AppError("You do not have permission to do this", 403))
  }
})


