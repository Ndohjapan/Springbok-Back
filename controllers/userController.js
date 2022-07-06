const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const {
  userFeedingSchema,
  userSchema,
  transactionSchema,
} = require("../models/mainModel");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? req.query.limit : 10000000;

  const options = {
    page: page,
    limit: limit,
    sort: { createdAt: -1 },
  };

  userSchema.paginate(
    { role: { $ne: "restaurant" } },
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

exports.updateUser = catchAsync(async (req, res, next) => {
  let data = req.body;
  let updateData = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value != "") {
      updateData[key] = value;
    }
  });

  let user = await userSchema.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  });

  res.status(200).send({ status: true, message: "User Updated", data: user });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  let userId = req.params.id;
  let userIds = req.body.userIds;
  const user = await userSchema.deleteMany({ _id: { $in: userIds } });
  let userFeeding = userFeedingSchema.deleteMany({ userId: { $in: userIds } });
  let transactions = transactionSchema.deleteMany({ from: { $in: userIds } });
  Promise.all([userFeeding, transactions]).then((result) => {
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

  let user = await userSchema.find({ updateData, role: { $ne: "restaurant" } });

  res.status(200).send({ status: true, message: "Successful", data: user });
});
