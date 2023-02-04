const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const {
  userFeedingSchema,
  userSchema,
  transactionSchema,
} = require("../models/mainModel");
const {getCachedData, setCacheData, delcacheData} = require("../utils/client")

exports.getAllUsers = catchAsync(async (req, res, next) => {
  // let page = req.query.page ? req.query.page : 1;
  // let limit = req.query.limit ? req.query.limit : 10000000;

  const options = {
    sort: { createdAt: -1 },
  };

  userSchema.paginate(
    { role: { $ne: "restaurant" }, verified: true },
    options,
    function (err, result) {
      if (err) {
        console.log(err);
        res.status(400).send(err);
      } else {
        res
          .status(200)
          .send({ status: true, message: "Successful", payload: result.docs });
      }
    }
  );
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await userSchema.findById(req.params.id);

  res.status(200).send({ status: true, message: "Successful", data: user });
});

exports.getAllUserData = catchAsync(async (req, res, next) => {
  const userProfileData = await userSchema.findById(req.params.id);
  const userFeedingData = await userFeedingSchema.findOne({userId: req.params.id})

  res.status(200).send({ status: true, message: "Successful", profileData: userProfileData, feedingData: userFeedingData });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  let data = req.body;
  let updateData = {};

  data.permissions = ""
  data.password = ""

  Object.entries(data).forEach(([key, value]) => {
    if (value != "") {
      updateData[key] = value;
    }
  });

  if(req.user.permissions){
    if(req.user.permissions.some(value => ['all', 'edit users'].includes(value))){
      user = await userSchema.updateOne({_id: req.params.id}, updateData, {
        new: true,
      });

    }
    else{
      return next(new AppError("You do not have permission to do this", 403))
    }
  }
  else{   
    let user = await userSchema.updateOne({_id: req.params.id, studentStatus: false}, updateData, {
      new: true,
    });
  
    if(user.matchedCount != 1){
      return next(new AppError("You cannot update your profile", 400));
  
    }
  }

  user = await userSchema.findById(req.params.id);

  return res.status(200).send({ status: true, message: "User Updated", data: user });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  let userId = req.params.id;
  let userIds = req.body.userIds;
  const user = await userSchema.deleteMany({ _id: { $in: userIds } });
  let userFeeding = userFeedingSchema.deleteMany({ userId: { $in: userIds } });
  Promise.all([userFeeding]).then(async (result) => {
    await delcacheData("allUsers")
    await delcacheData("legibleUsers")
    res.status(204).send({ status: true, message: "User Deleted" });
  });
});

exports.postFilter = catchAsync(async (req, res, next) => {
  let data = req.body;
  let updateData = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value != "") {
      updateData[key] = value;
    }
  });

  let user = await userSchema.find({ updateData, role: { $ne: "restaurant" }, verified: true });

  res.status(200).send({ status: true, message: "Successful", data: user });
});
