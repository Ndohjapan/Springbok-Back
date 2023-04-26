const request = require("supertest");
const {
  userSchema,
  userFeedingSchema,
  adminSchema,
  restaurantSchema,
  restaurantTransactionsSchema,
  transactionSchema,
} = require("../../models/mainModel");

const mockData = require("./mockdata.json");
const { default: mongoose } = require("mongoose");

const { transactionPin, restaurant1, restaurant2, restaurant3, user1 } =
  mockData;

exports.createAdminAndLogin = async (admin, app) => {
  admin = await adminSchema.create(admin);
  const response = await request(app)
    .post("/api/v1/users/adminSignin")
    .send({ email: admin.email, password: "12345678" });

  const token = response.body.token;

  return { token, admin };
};

exports.createUser = async (
  user,
  studentStatus = true,
  totalFeedingAmount = 0,
  fundingStatus = false,
  feedingType = 2,
  numOfTimesFunded = 0,
  totalAmountFunded = 0
) => {
  user.studentStatus = studentStatus;

  user = await userSchema.create(user);

  const userFeding = await userFeedingSchema.create({
    userId: user["_id"].toString(),
    transactionPin,
    studentStatus,
    fundingStatus,
    feedingType,
    totalFeedingAmount,
    numOfTimesFunded,
    totalAmountFunded,
    amountLeft: totalFeedingAmount
  });

  return { user, userFeding };
};

exports.userLogin = async (email, app) => {
  const response = await request(app)
    .post("/api/v1/users/signin")
    .send({ email: email, password: "12345678" });

  const token = response.body.token;

  return { token, response };
};

exports.createRestaurants = async () => {
  const result = await restaurantSchema.create([
    restaurant1,
    restaurant2,
    restaurant3,
  ]);

  let details = [
    { restaurantId: result[0].id, restaurantName: result[0].name },
    { restaurantId: result[1].id, restaurantName: result[1].name },
    { restaurantId: result[2].id, restaurantName: result[2].name },
  ];

  await restaurantTransactionsSchema.create(details);

  return { rest1: result[0].id, rest2: result[1].id, rest3: result[2].id };
};

exports.sendTransactions = async (userId, restaurantId, amount) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await userFeedingSchema.findOne({ userId });
    const restaurant = await restaurantSchema.findById(restaurantId);

    // Get user and restaurants balance.
    let balance = parseInt(user.balance);
    let restaurantBalance = parseInt(restaurant.balance);

    let userUpdate = await userFeedingSchema.findOneAndUpdate(
      { userId },
      { $inc: { balance: -amount }, $set: { previousBalance: balance } },
      { new: true }
    );

    await restaurantSchema.findByIdAndUpdate(
      restaurantId,
      {
        $inc: { balance: amount },
        $set: { previousBalance: restaurantBalance },
      },
      { new: true }
    );

    await transactionSchema.create({
      from: userId,
      to: restaurantId,
      amount: amount,
      restaurantPreviousBalance: restaurantBalance,
      restaurantCurrentBalance: restaurantBalance + amount,
      studentPreviousBalance: balance,
      studentCurrentBalance: userUpdate.balance,
    });

    await restaurantTransactionsSchema.updateOne(
      { restaurantId: restaurantId },
      { $inc: { totalTransactions: 1, totalTransactionsAmount: amount } }
    );

    await session.commitTransaction();
    await session.endSession();
    return true;
  } catch (error) {
    await session.abortTransaction();
    return false;
  }
};