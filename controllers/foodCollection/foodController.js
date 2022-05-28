const {foodSchema} = require("../../models/mainModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");

exports.postFood = catchAsync(async (req, res, next) => {
  const { name, servedWith, description, price } = req.body;
  console.log(req.user);

  const createdBy = req.user["_id"];

  const food = await foodSchema.create({
    name,
    servedWith,
    description,
    price,
    createdBy,
  });

  res.status(200).send({ status: true, message: "Food Created", data: food });
});

exports.getAllFoods = catchAsync(async (req, res, next) => {
  const food = await foodSchema.find({});
  res.status(200).send({ status: true, message: "Successful", data: food });
});

exports.getFood = catchAsync(async (req, res, next) => {
  const food = await foodSchema.findById(req.params.id);
  res.status(200).send({ status: true, message: "Successful", data: food });
});

exports.updateFood = catchAsync(async (req, res, next) => {
  let data = req.body;
  let updateData = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value != "") {
      updateData[key] = value;
    }
  });

  try{
    let food = await foodSchema.findOneAndUpdate(
      { _id: req.params.id },
      updateData,
      { new: true }
    );
    res.status(200).send({ status: true, message: "Food Updated", data: food });
  }catch(err){
    console.log(err)
    res.status(400).send({ status: false, message: "Error In Update"});  
  }

});

exports.deleteFood = catchAsync(async (req, res, next) => {
  await foodSchema.findByIdAndDelete(req.params.id);
  res.status(200).send({ status: true, message: "Food Deleted" });
});

exports.postFilter = catchAsync(async (req, res, next) => {
  let data = req.body;
  let updateData = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value != "") {
      updateData[key] = value;
    }
  });

  let food = await foodSchema.find(updateData);
  res.status(200).send({ status: true, message: "Successful", data: food });
});
