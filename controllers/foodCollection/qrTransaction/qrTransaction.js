const moment = require("moment");
const {
  restaurantSchema,
  transactionSchema,
  userFeedingSchema,
  utilsSchema,
  restaurantTransactionsSchema,
  tempoararyTransactionsSchema,
} = require("../../../models/mainModel");
const AppError = require("../../../utils/appError");
const catchAsync = require("../../../utils/catchAsync");
const { getCachedData, setCacheData } = require("../../../utils/client");
const ObjectId = require("mongoose").Types.ObjectId;
const { sendTransactionToRestaurant } = require("../../../utils/activityLogs");
const en = require("../../../locale/en/translation");

exports.checkBalance = catchAsync(async (req, res, next) => {
  const userId = req.user["_id"].toString();
  const result = await userFeedingSchema.findOne({ userId: userId });

  res.status(200).send({ status: true, balance: result.balance });
});

exports.confirmRestaurant = catchAsync(async (req, res, next) => {
  const restaurantId = req.params.id;

  if (ObjectId.isValid(restaurantId)) {
    if (String(new ObjectId(restaurantId)) === restaurantId) {
      const restaurant = await restaurantSchema
        .findById(restaurantId)
        .select("-balance -previousBalance");
      if (restaurant.name) {
        res.status(200).send({ status: true, data: restaurant });
      } else {
        return next(new AppError("Invalid Restaurant ID", 400));
      }
    }
    return next(new AppError("Invalid Restaurant ID", 400));
  } else {
    return next(new AppError("Invalid Restaurant ID", 400));
  }
});

exports.doTransfer = catchAsync(async (req, res, next) => {
  const userId = req.user["_id"].toString();
  let { transactionPin, amount, restaurantId } = req.body;

  amount = parseInt(amount);

  const user = await userFeedingSchema.findOne({ userId: userId });
  const restaurant = await restaurantSchema.findById(restaurantId);

  // Get user and restaurants balance.
  const balance = parseInt(user.balance);
  const restaurantBalance = parseInt(restaurant.balance);

  // Confirm the user pin
  const checkPin = await user.checkPin(transactionPin);

  if (!checkPin) {
    return next(new AppError(en.wrong_pin, 400));
  } else {
    if (balance < amount || amount < 1) {
      return next(new AppError(en.insufficient_balance, 400));
    } else {
      // Update the users details
      const userUpdate = await userFeedingSchema.findOneAndUpdate(
        { userId: userId },
        { $inc: { balance: -amount }, $set: { previousBalance: balance } },
        { new: true }
      );

      // Update restaurants details
      await restaurantSchema.findByIdAndUpdate(
        restaurantId,
        {
          $inc: { balance: amount },
          $set: { previousBalance: restaurantBalance },
        },
        { new: true }
      );

      // Create a transaction document
      let transaction = await transactionSchema.create({
        from: userId,
        to: restaurantId,
        amount: amount,
        restaurantPreviousBalance: restaurantBalance,
        restaurantCurrentBalance: restaurantBalance + amount,
        studentPreviousBalance: balance,
        studentCurrentBalance: userUpdate.balance,
      });

      transaction = await transactionSchema
        .findById(transaction["_id"].toString())
        .populate(["from", "to"])
        .select("-updatedAt");

      await utilsSchema.updateMany(
        {},
        { $inc: { totalAmountSpent: amount, totalTransactions: 1 } }
      );
      await restaurantTransactionsSchema.updateOne(
        { restaurantId: restaurantId },
        { $inc: { totalTransactions: 1, totalTransactionsAmount: amount } }
      );

      return res.status(200).send({ status: true, payload: transaction });
    }
  }
});

exports.confirmPinandBalance = catchAsync(async (req, res, next) => {
  const userId = req.user["_id"].toString();
  const { transactionPin, amount } = req.body;

  const user = await userFeedingSchema.findOne({ userId: userId });

  const balance = user.balance;

  const checkPin = await user.checkPin(transactionPin);
  if (!checkPin) {
    return next(new AppError("Wrong Pin", 400));
  } else {
    if (await confirm(balance, amount)) {
      return res
        .status(200)
        .send({ status: true, message: "Confirmation Successful" });
    } else {
      return next(new AppError("Insufficient Funds", 400));
    }
  }
});

exports.restaurantDoTransfer = catchAsync(async (req, res, next) => {
  const { userId, amount } = req.body;
  const restaurantId = req.user["_id"].toString();

  let transaction = await tempoararyTransactionsSchema.create({
    from: userId,
    to: restaurantId,
    amount: amount,
  });

  transaction = await tempoararyTransactionsSchema
    .findById(transaction["_id"].toString())
    .populate(["from", "to"])
    .select("-updatedAt");

  await restaurantTransactionsSchema.updateOne(
    { restaurantId: restaurantId },
    { $inc: { manualTransactions: 1, manualTransactionsAmount: amount } },
    { new: true }
  );
  await restaurantSchema.updateOne(
    { _id: restaurantId },
    { $inc: { manualTransactions: 1, manualTransactionsAmount: amount } },
    { new: true }
  );

  res.status(200).send({ status: true, payload: transaction });
});

exports.validateTransaction = catchAsync(async (req, res, next) => {
  const socket = req.app.get("socket");
  const userId = req.user["_id"].toString();
  const lastTransaction = await transactionSchema
    .findOne({ from: req.user["_id"].toString() })
    .sort({ createdAt: -1 })
    .populate(["from"]);
  res.send({ status: true });
  return sendTransactionToRestaurant(socket, lastTransaction);
});

async function confirm(balance, amount) {
  if (balance < amount || amount < 1) {
    return false;
  } else {
    return true;
  }
}

async function weeklyLimit(userInfo, amount) {
  /**
   * @params
   * userInfo: user object in the request.user
   * amount: amount to spend by current user
   *
   * @returns
   * return [true, errorText]
   * 'returns an array of transaction status as well as error text to send to the user.'
   */

  const [settings] = await utilsSchema.find();

  // Get date for this transaction
  const today = moment();

  // Moment is mutable, so don't work with a date you have previously stored.

  // Store beginning of week from current transaction date in a variable - beginningOfWeek
  const beginningOfWeek = moment().startOf("isoWeek").startOf("day");

  // Get all transactions from beginning of week to current date
  const transactions = await transactionSchema.find({
    from: userInfo.userId,
    createdAt: { $gte: beginningOfWeek.toDate(), $lte: today.toDate() },
  });

  // Sum all amounts and store in - amount spent this week
  let amountSpentThisWeek = 0;
  if (transactions && transactions.length > 0) {
    transactions.map((t) => (amountSpentThisWeek += t.amount));
  }

  // Check if weeklyAmountSpent + (amount of current transaction) exceeds users weekly feeding limit
  const usersWeeklyLimit =
    userInfo.feedingType === 2
      ? settings.feedingPlanLimits.twoMeals
      : settings.feedingPlanLimits.threeMeals;

  if (amount > usersWeeklyLimit) {
    return [
      false,
      `Sorry, you can't spend more than #${usersWeeklyLimit} weekly.`,
    ];
  }

  // if it does exceed, return a transaction is invalid error
  if (
    parseInt(amountSpentThisWeek) + parseInt(amount) >
    parseInt(usersWeeklyLimit)
  ) {
    let errText = "";
    const amountLeftToSpendThisWeek = usersWeeklyLimit - amountSpentThisWeek;

    if (amountLeftToSpendThisWeek <= 0) {
      errText =
        "That's it, you have exceeded your weekly limit.\nYour limit resets next week monday.";
    } else {
      errText = `Sorry, You have only #${amountLeftToSpendThisWeek} left to spend this week.`;
    }

    return [false, errText];
  }

  // User has not reached limit if checks reach here
  return [true, "Success"];
}
