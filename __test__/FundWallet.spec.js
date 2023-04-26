const app = require("../app");
const request = require("supertest");
const mongoose = require("mongoose");
const moment = require("moment");
const {
  admin1,
  user1,
  user2,
  user3,
  restaurant1: rest1,
  utils,
} = require("./resources/mockdata.json");
const {
  createUser,
  createAdminAndLogin,
  sendTransactions,
  createRestaurants,
} = require("./resources/functions");
const {
  utilsSchema,
  userFeedingSchema,
  userSchema,
  disbursementSchema,
  activitySchema,
} = require("../models/mainModel");
const en = require("../locale/en/translation");

beforeEach(async () => {
  await mongoose.connect("mongodb://localhost:27017/test3", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await utilsSchema.create(utils);
});

afterEach(async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  } catch (error) {
    return true;
  }
});

describe("Fund only one student", () => {
  const fundWallet = async (token, userIds) => {
    const agent = request(app).post("/feeding/fundWallet");

    agent.set("x-auth-token", token);

    return agent.send({ userIds });
  };

  it("return 200 when the funding is done successfully", async () => {
    const { user } = await createUser(user1, true, 270000, false, 2);
    const { token } = await createAdminAndLogin(admin1, app);
    const response = await fundWallet(token, [user.id]);

    expect(response.status).toBe(200);
  });

  it("return successful update message when funding is complete", async () => {
    const { user } = await createUser(user1, true, 270000, false, 2);
    const { token } = await createAdminAndLogin(admin1, app);
    const response = await fundWallet(token, [user.id]);

    expect(response.body.message).toBe(en.sucessful_update);
  });

  it("check if it will fund a user who is yet to be validated", async () => {
    let { user } = await createUser(user1, false, 270000);
    const { token } = await createAdminAndLogin(admin1, app);
    await fundWallet(token, [user.id]);

    const userInDb1 = await userFeedingSchema.findOne({ userId: user.id });

    expect(userInDb1.fundingStatus).toBeFalsy();
    expect(userInDb1.balance).toBe(0);
  });

  it("check if the user was funded based on his feeding type", async () => {
    let { user } = await createUser(user1, true, 270000, false, 2);
    const createUser2 = await createUser(user2, true, 405000, false, 3);
    const { token } = await createAdminAndLogin(admin1, app);
    await fundWallet(token, [user.id]);
    await fundWallet(token, [createUser2.user.id]);

    const userInDb1 = await userFeedingSchema.findOne({ userId: user.id });
    const userInDb2 = await userFeedingSchema.findOne({
      userId: createUser2.user.id,
    });

    expect(userInDb1.balance).toBe(30000);
    expect(userInDb2.balance).toBe(45000);
  });

  it("check if the user funding status was set to true to avoid funding until next month", async () => {
    let { user } = await createUser(user1, true, 270000, false, 2);
    const { token } = await createAdminAndLogin(admin1, app);
    await fundWallet(token, [user.id]);

    const userInDb1 = await userFeedingSchema.findOne({ userId: user.id });

    expect(userInDb1.fundingStatus).toBeTruthy();
  });

  it("check if the number of times  funded also increased by 1", async () => {
    let { user } = await createUser(user1, true, 270000, false, 2);
    const { token } = await createAdminAndLogin(admin1, app);
    await fundWallet(token, [user.id]);

    const userInDb1 = await userFeedingSchema.findOne({ userId: user.id });

    expect(userInDb1.numOfTimesFunded).toBe(1);
  });

  it("check if the amount left also reduced by the new balance after the user if funded", async () => {
    let { user } = await createUser(user1, true, 270000, false, 2);
    const { token } = await createAdminAndLogin(admin1, app);
    await fundWallet(token, [user.id]);

    const userInDb1 = await userFeedingSchema.findOne({ userId: user.id });

    expect(userInDb1.amountLeft).toBe(270000 - userInDb1.balance);
  });

  it("check if the total amount funded has increased by the new balance", async () => {
    let { user } = await createUser(user1, true, 270000, false, 2);
    const { token } = await createAdminAndLogin(admin1, app);
    await fundWallet(token, [user.id]);

    const userInDb1 = await userFeedingSchema.findOne({ userId: user.id });

    expect(userInDb1.totalAmountFunded).toBe(30000);
  });

  it("check if the last funding date has been changed to today", async () => {
    let { user } = await createUser(user1, true, 270000, false, 2);
    const { token } = await createAdminAndLogin(admin1, app);
    await fundWallet(token, [user.id]);

    const userInDb1 = await userFeedingSchema.findOne({ userId: user.id });

    let todaysDate = new Date().toISOString();
    let fundingDay = moment(todaysDate, "YYYY-MM-DD").format("YYYY-MM-DD");

    expect(userInDb1.lastFunding).not.toBe(user.lastFunding);
    expect(userInDb1.lastFunding).toBe(fundingDay);
  });

  it("ensure double funding is not possible in a one month period", async () => {
    let { user } = await createUser(user1, true, 270000, false, 2);
    const { token } = await createAdminAndLogin(admin1, app);
    await fundWallet(token, [user.id]);
    await fundWallet(token, [user.id]);

    const userInDb1 = await userFeedingSchema.findOne({ userId: user.id });

    expect(userInDb1.balance).toBe(30000);
  });

  it("check if account will be funded again after I have exhausted how much is in the total feeding Amount field", async () => {
    let { user } = await createUser(user1, true, 270000, false, 2);
    const { token } = await createAdminAndLogin(admin1, app);
    for (i = 0; i < 10; i++) {
      await fundWallet(token, [user.id]);
      await userFeedingSchema.updateMany(
        {},
        { $set: { fundingStatus: false } }
      );
    }

    const userInDb1 = await userFeedingSchema.findOne({ userId: user.id });

    expect(userInDb1.totalAmountFunded).toBe(270000);
    expect(userInDb1.numOfTimesFunded).toBe(9);
  }, 20000);

  it("check if it will only fund 8 times when the amount paid is less than 270000 but greater than 240000", async () => {
    let { user } = await createUser(user1, true, 255000, false, 2);
    const { token } = await createAdminAndLogin(admin1, app);
    for (i = 0; i < 10; i++) {
      await fundWallet(token, [user.id]);
      await userFeedingSchema.updateMany(
        {},
        { $set: { fundingStatus: false } }
      );
    }

    const userInDb1 = await userFeedingSchema.findOne({ userId: user.id });

    expect(userInDb1.totalAmountFunded).toBe(240000);
    expect(userInDb1.numOfTimesFunded).toBe(8);
  }, 20000);

  it("check if the disbursement schema recorded the funding that occurred", async () => {
    let { user } = await createUser(user1, true, 255000, false, 2);
    const { token } = await createAdminAndLogin(admin1, app);
    for (i = 0; i < 10; i++) {
      await fundWallet(token, [user.id]);
      await userFeedingSchema.updateMany(
        {},
        { $set: { fundingStatus: false } }
      );
    }

    const disbursements = await disbursementSchema.find({});

    expect(disbursements.length).toBe(8);
    let amount = 0;
    let students = 0;
    for (i = 0; i < disbursements.length; i++) {
      amount += disbursements[i].amount;
      students += disbursements[i].numberOfStudents;
    }
    expect(amount).toBe(240000);
    expect(students).toBe(8);
  });

  it("check if a disbursement is created for a student who is not validated yet", async () => {
    let { user } = await createUser(user1, false, 255000, false, 2);
    const { token } = await createAdminAndLogin(admin1, app);
    for (i = 0; i < 10; i++) {
      await fundWallet(token, [user.id]);
      await userFeedingSchema.updateMany(
        {},
        { $set: { fundingStatus: false } }
      );
    }

    const disbursements = await disbursementSchema.find({});

    expect(disbursements.length).toBe(0);
    let amount = 0;
    let students = 0;
    for (i = 0; i < disbursements.length; i++) {
      amount += disbursements[i].amount;
      students += disbursements[i].numberOfStudents;
    }
    expect(amount).toBe(0);
    expect(students).toBe(0);
  });

  it("check if the util schema filed keeping track of disbursement is increamenting for every succesful funding", async () => {
    let { user } = await createUser(user1, true, 255000, false, 2);
    const { token } = await createAdminAndLogin(admin1, app);
    for (i = 0; i < 10; i++) {
      await fundWallet(token, [user.id]);
      await userFeedingSchema.updateMany(
        {},
        { $set: { fundingStatus: false } }
      );
    }

    const utils = await utilsSchema.find({});

    expect(utils[0].totalDisbursedAmount).toBe(240000);
  });

  it("check if activity logs recorded the funding that occurred", async () => {
    let { user } = await createUser(user1, true, 255000, false, 2);
    const { token, admin } = await createAdminAndLogin(admin1, app);
    for (i = 0; i < 10; i++) {
      await fundWallet(token, [user.id]);
      await userFeedingSchema.updateMany(
        {},
        { $set: { fundingStatus: false } }
      );
    }

    const activity = await activitySchema.find({});

    expect(activity.length).toBe(8);

    for (i = 0; i < activity.length; i++) {
      expect(activity[i].by).toBe(admin.id);
      expect(activity[i].activity).toBe(
        ` funded 1 students with total of 30000 naira`
      );
      expect(activity[i].type).toBe("Update");
    }
  });

  it("Even after performing transactions a user is legible for funding on due date", async () => {
    let { user } = await createUser(user1, true, 255000, false, 2);
    const { rest1, rest2, rest3 } = await createRestaurants();
    const { token } = await createAdminAndLogin(admin1, app);
    await fundWallet(token, [user.id]);

    let afterFunding1 = await userFeedingSchema.findOne({ userId: user.id });

    let restaurants = [rest1, rest2, rest3];
    let count = 6;
    let amounts = [1000, 5000, 200, 1600, 2300, 1530];
    let totalAmount = 0;
    let numOfRests = restaurants.length;

    for (i = 0; i < count; i++) {
      let restId = restaurants[i % numOfRests];
      totalAmount += amounts[i];
      await sendTransactions(user.id, restId, amounts[i]);
    }

    await userFeedingSchema.updateMany({}, { $set: { fundingStatus: false } });

    let beforeFunding1 = await userFeedingSchema.findOne({ userId: user.id });

    let currentBalance = afterFunding1.balance - totalAmount;

    await fundWallet(token, [user.id]);

    let afterFunding2 = await userFeedingSchema.findOne({ userId: user.id });

    expect(afterFunding1.balance).toBe(30000);
    expect(beforeFunding1.balance).toBe(currentBalance);
    expect(afterFunding2.balance).toBe(currentBalance + 30000);
  });
});

describe("Fund only one student", () => {
  const fundWallet = async (token) => {
    const agent = request(app).post("/feeding/fundAllLegibleWallets");

    agent.set("x-auth-token", token);

    return agent.send();
  };

  it("return 200 when the funding is done successfully", async () => {
    await createUser(user1, true, 270000, false, 2);
    await createUser(user2, true, 270000, false, 2);
    await createUser(user3, true, 270000, false, 2);
    const { token } = await createAdminAndLogin(admin1, app);
    const response = await fundWallet(token);

    expect(response.status).toBe(200);
  });

  it("return successful update message when funding is complete", async () => {
    await createUser(user1, true, 270000, false, 2);
    await createUser(user2, true, 270000, false, 2);
    await createUser(user3, true, 270000, false, 2);
    const { token } = await createAdminAndLogin(admin1, app);
    const response = await fundWallet(token);

    expect(response.body.message).toBe(en.sucessful_update);
  });

  it("check if it will fund a user who is yet to be validated", async () => {
    await createUser(user1, false, 270000, false, 2);
    await createUser(user2, true, 270000, false, 2);
    await createUser(user3, false, 270000, false, 2);
    const { token } = await createAdminAndLogin(admin1, app);
    await fundWallet(token);

    const verifiedStudents = await userFeedingSchema.countDocuments({
      studentStatus: true,
    });
    const unverifiedStudents = await userFeedingSchema.countDocuments({
      studentStatus: false,
    });
    const studentsFunded = await userFeedingSchema.countDocuments({
      balance: 30000,
    });
    const studentsNotFunded = await userFeedingSchema.countDocuments({
      balance: 0,
    });

    expect(verifiedStudents).toBe(1);
    expect(unverifiedStudents).toBe(2);
    expect(studentsFunded).toBe(1);
    expect(studentsNotFunded).toBe(2);
  });

  it("check if it will fund a users who have their funding status as true", async () => {
    await createUser(user1, true, 270000, false, 2);
    await createUser(user2, true, 270000, true, 2);
    await createUser(user3, true, 270000, false, 2);
    const { token } = await createAdminAndLogin(admin1, app);
    await fundWallet(token);

    const studentsFunded = await userFeedingSchema.countDocuments({
      balance: 30000,
    });
    const studentsNotFunded = await userFeedingSchema.countDocuments({
      balance: 0,
    });

    expect(studentsFunded).toBe(2);
    expect(studentsNotFunded).toBe(1);
  });

  it("check if the users was funded based on his feeding type", async () => {
    await createUser(user1, true, 270000, false, 2);
    await createUser(user2, true, 405000, false, 3);
    await createUser(user3, true, 405000, false, 3);
    const { token } = await createAdminAndLogin(admin1, app);

    const twoMealBefore = await userFeedingSchema.find({ feedingType: 2 });
    const threeMealBefore = await userFeedingSchema.find({ feedingType: 3 });

    await fundWallet(token);
    await fundWallet(token);

    const twoMealAfter = await userFeedingSchema.find({ feedingType: 2 });
    const threeMealAfter = await userFeedingSchema.find({ feedingType: 3 });

    expect(twoMealBefore.length).toBe(1);
    expect(twoMealBefore[0].balance).toBe(0);
    expect(threeMealBefore.length).toBe(2);
    expect(threeMealBefore[0].balance).toBe(0);
    expect(threeMealBefore[1].balance).toBe(0);
    expect(twoMealAfter.length).toBe(1);
    expect(threeMealAfter.length).toBe(2);
    expect(twoMealAfter[0].balance).toBe(30000);
    expect(threeMealAfter[0].balance).toBe(45000);
    expect(threeMealAfter[1].balance).toBe(45000);
  });

  it("check if the user funding status was set to true to avoid funding until next month", async () => {
    await createUser(user1, true, 270000, false, 2);
    await createUser(user2, true, 405000, true, 3);
    await createUser(user3, true, 405000, false, 3);
    const { token } = await createAdminAndLogin(admin1, app);

    const falseBefore = await userFeedingSchema.find({ fundingStatus: false });
    const trueBefore = await userFeedingSchema.find({ fundingStatus: true });

    await fundWallet(token);

    const falseAfter = await userFeedingSchema.find({ fundingStatus: false });
    const trueAfter = await userFeedingSchema.find({ fundingStatus: true });

    expect(falseBefore.length).toBe(2);
    expect(falseBefore[0].balance).toBe(0);
    expect(falseBefore[1].balance).toBe(0);
    expect(trueBefore.length).toBe(1);
    expect(trueBefore[0].balance).toBe(0);
    expect(falseAfter.length).toBe(0);
    expect(trueAfter.length).toBe(3);
    expect(trueAfter[0].balance).toBe(30000);
    expect(trueAfter[1].balance).toBe(0);
    expect(trueAfter[2].balance).toBe(45000);
  });

  it("check if the number of times  funded also increased by 1", async () => {
    await createUser(user1, true, 270000, false, 2);
    await createUser(user2, true, 405000, false, 3);
    await createUser(user3, true, 405000, false, 3);
    const { token } = await createAdminAndLogin(admin1, app);

    const before = await userFeedingSchema.find({ fundingStatus: false });

    await fundWallet(token);

    const falseAfter = await userFeedingSchema.find({ fundingStatus: false });

    const trueAfter = await userFeedingSchema.find({ fundingStatus: true });

    expect(before.length).toBe(3);
    expect(before[0].numOfTimesFunded).toBe(0);
    expect(before[1].numOfTimesFunded).toBe(0);
    expect(before[2].numOfTimesFunded).toBe(0);
    expect(falseAfter.length).toBe(0);
    expect(trueAfter.length).toBe(3);
    expect(trueAfter[0].numOfTimesFunded).toBe(1);
    expect(trueAfter[1].numOfTimesFunded).toBe(1);
    expect(trueAfter[2].numOfTimesFunded).toBe(1);
  });

  it("check if the amount left also reduced by the new balance after the user if funded", async () => {
    await createUser(user1, true, 270000, false, 2);
    await createUser(user2, true, 405000, false, 3);
    await createUser(user3, true, 405000, false, 3);
    const { token } = await createAdminAndLogin(admin1, app);

    const before = await userFeedingSchema.find({ fundingStatus: false });

    await fundWallet(token);

    const falseAfter = await userFeedingSchema.find({ fundingStatus: false });

    const trueAfter = await userFeedingSchema.find({ fundingStatus: true });

    expect(before.length).toBe(3);
    expect(before[0].amountLeft).toBe(270000);
    expect(before[1].amountLeft).toBe(405000);
    expect(before[2].amountLeft).toBe(405000);
    expect(falseAfter.length).toBe(0);
    expect(trueAfter.length).toBe(3);
    expect(trueAfter[0].amountLeft).toBe(240000);
    expect(trueAfter[1].amountLeft).toBe(360000);
    expect(trueAfter[2].amountLeft).toBe(360000);
  });

  it("check if the total amount funded has increased by the new balance", async () => {
    await createUser(user1, true, 270000, false, 2);
    await createUser(user2, true, 405000, false, 3);
    await createUser(user3, true, 405000, false, 3);
    const { token } = await createAdminAndLogin(admin1, app);

    const before = await userFeedingSchema.find({ fundingStatus: false });

    await fundWallet(token);

    const falseAfter = await userFeedingSchema.find({ fundingStatus: false });

    const trueAfter = await userFeedingSchema.find({ fundingStatus: true });

    expect(before.length).toBe(3);
    expect(before[0].totalAmountFunded).toBe(0);
    expect(before[1].totalAmountFunded).toBe(0);
    expect(before[2].totalAmountFunded).toBe(0);
    expect(falseAfter.length).toBe(0);
    expect(trueAfter.length).toBe(3);
    expect(trueAfter[0].totalAmountFunded).toBe(30000);
    expect(trueAfter[1].totalAmountFunded).toBe(45000);
    expect(trueAfter[2].totalAmountFunded).toBe(45000);
  });

  it("check if the last funding date has been changed to today", async () => {
    await createUser(user1, true, 270000, false, 2);
    await createUser(user2, true, 405000, false, 3);
    await createUser(user3, true, 405000, false, 3);
    const { token } = await createAdminAndLogin(admin1, app);

    const before = await userFeedingSchema.find({ fundingStatus: false });

    let todaysDate = new Date().toISOString();
    let fundingDay = moment(todaysDate, "YYYY-MM-DD").format("YYYY-MM-DD");

    await fundWallet(token);

    const falseAfter = await userFeedingSchema.find({ fundingStatus: false });

    const trueAfter = await userFeedingSchema.find({ fundingStatus: true });

    expect(before.length).toBe(3);
    expect(before[0].lastFunding).not.toBe(fundingDay);
    expect(before[1].lastFunding).not.toBe(fundingDay);
    expect(before[2].lastFunding).not.toBe(fundingDay);
    expect(falseAfter.length).toBe(0);
    expect(trueAfter.length).toBe(3);
    expect(trueAfter[0].lastFunding).toBe(fundingDay);
    expect(trueAfter[1].lastFunding).toBe(fundingDay);
    expect(trueAfter[2].lastFunding).toBe(fundingDay);
  });

  it("ensure double funding is not possible in a one month period", async () => {
    await createUser(user1, true, 270000, false, 2);
    await createUser(user2, true, 405000, false, 3);
    await createUser(user3, true, 405000, false, 3);
    const { token } = await createAdminAndLogin(admin1, app);

    const before = await userFeedingSchema.find({ fundingStatus: false });

    await fundWallet(token);
    await fundWallet(token);

    const trueAfter = await userFeedingSchema.find({ fundingStatus: true });

    expect(before.length).toBe(3);
    expect(before[0].balance).toBe(0);
    expect(before[1].balance).toBe(0);
    expect(before[2].balance).toBe(0);
    expect(trueAfter.length).toBe(3);
    expect(trueAfter[0].balance).toBe(30000);
    expect(trueAfter[1].balance).toBe(45000);
    expect(trueAfter[2].balance).toBe(45000);
  });

  it("check if account will be funded again after I have exhausted how much is in the total feeding Amount field", async () => {
    await createUser(user1, true, 270000, false, 2);
    await createUser(user2, true, 405000, false, 3);
    await createUser(user3, true, 405000, false, 3);
    const { token } = await createAdminAndLogin(admin1, app);
    for (i = 0; i < 10; i++) {
      await fundWallet(token);
      await userFeedingSchema.updateMany(
        {},
        { $set: { fundingStatus: false } }
      );
    }

    const usersInDb = await userFeedingSchema.find({});

    expect(usersInDb[0].totalAmountFunded).toBe(270000);
    expect(usersInDb[0].numOfTimesFunded).toBe(9);
    expect(usersInDb[1].totalAmountFunded).toBe(405000);
    expect(usersInDb[1].numOfTimesFunded).toBe(9);
    expect(usersInDb[2].totalAmountFunded).toBe(405000);
    expect(usersInDb[2].numOfTimesFunded).toBe(9);
  }, 20000);

  it("check if it will only fund 7 times when the amount paid is for only 7 months ", async () => {
    await createUser(user1, true, 220000, false, 2);
    await createUser(user2, true, 320000, false, 3);
    await createUser(user3, true, 333000, false, 3);
    const { token } = await createAdminAndLogin(admin1, app);
    for (i = 0; i < 10; i++) {
      await fundWallet(token);
      await userFeedingSchema.updateMany(
        {},
        { $set: { fundingStatus: false } }
      );
    }

    const usersInDb = await userFeedingSchema.find({});

    expect(usersInDb[0].totalAmountFunded).toBe(210000);
    expect(usersInDb[0].numOfTimesFunded).toBe(7);
    expect(usersInDb[1].totalAmountFunded).toBe(315000);
    expect(usersInDb[1].numOfTimesFunded).toBe(7);
    expect(usersInDb[2].totalAmountFunded).toBe(315000);
    expect(usersInDb[2].numOfTimesFunded).toBe(7);
  }, 20000);

  it("check if the disbursement schema recorded the funding that occurred", async () => {
    await createUser(user1, true, 220000, false, 2);
    await createUser(user2, true, 320000, false, 3);
    await createUser(user3, true, 333000, false, 3);
    const { token } = await createAdminAndLogin(admin1, app);
    for (i = 0; i < 10; i++) {
      await fundWallet(token);
      await userFeedingSchema.updateMany(
        {},
        { $set: { fundingStatus: false } }
      );
    }

    const disbursements = await disbursementSchema.find({});

    expect(disbursements.length).toBe(7);
    let amount = 0;
    let students = 0;
    for (i = 0; i < disbursements.length; i++) {
      amount += disbursements[i].amount;
      students += disbursements[i].numberOfStudents;
    }
    expect(amount).toBe(840000);
    expect(students).toBe(21);
  });

  it("check if a disbursement is created for a student who is not validated yet", async () => {
    await createUser(user1, false, 220000, false, 2);
    await createUser(user2, true, 320000, false, 3);
    await createUser(user3, true, 333000, false, 3);
    const { token } = await createAdminAndLogin(admin1, app);
    for (i = 0; i < 10; i++) {
      await fundWallet(token);
      await userFeedingSchema.updateMany(
        {},
        { $set: { fundingStatus: false } }
      );
    }

    const disbursements = await disbursementSchema.find({});

    expect(disbursements.length).toBe(7);
    let amount = 0;
    let students = 0;
    for (i = 0; i < disbursements.length; i++) {
      amount += disbursements[i].amount;
      students += disbursements[i].numberOfStudents;
    }
    expect(amount).toBe(630000);
    expect(students).toBe(14);
  });

  it("check if the util schema filed keeping track of disbursement is increamenting for every succesful funding", async () => {
    await createUser(user1, true, 220000, false, 2);
    await createUser(user2, true, 320000, false, 3);
    await createUser(user3, true, 333000, false, 3);
    const { token } = await createAdminAndLogin(admin1, app);
    for (i = 0; i < 10; i++) {
      await fundWallet(token);
      await userFeedingSchema.updateMany(
        {},
        { $set: { fundingStatus: false } }
      );
    }

    const utils = await utilsSchema.find({});

    expect(utils[0].totalDisbursedAmount).toBe(840000);
  });

  it("check if activity logs recorded the funding that occurred", async () => {
    await createUser(user1, true, 220000, false, 2);
    await createUser(user2, true, 320000, false, 3);
    await createUser(user3, true, 333000, false, 3);
    const { token, admin } = await createAdminAndLogin(admin1, app);
    for (i = 0; i < 10; i++) {
      await fundWallet(token);
      await userFeedingSchema.updateMany(
        {},
        { $set: { fundingStatus: false } }
      );
    }

    const activity = await activitySchema.find({});

    expect(activity.length).toBe(7);

    for (i = 0; i < activity.length; i++) {
      expect(activity[i].by).toBe(admin.id);
      expect(activity[i].activity).toBe(
        ` funded 3 students who are legible after 30 days with total of 120000 naira`
      );
      expect(activity[i].type).toBe("Update");
    }
  });

  it("Even after performing transactions a user is legible for funding on due date", async () => {
    const { user: user_1 } = await createUser(user1, true, 220000, false, 2);
    const { user: user_2 } = await createUser(user2, true, 320000, false, 3);
    const { user: user_3 } = await createUser(user3, true, 333000, false, 3);
    const { rest1, rest2, rest3 } = await createRestaurants();
    const { token } = await createAdminAndLogin(admin1, app);
    await fundWallet(token);

    let afterFunding1 = await userFeedingSchema.find();

    let restaurants = [rest1, rest2, rest3];
    let users = [user_1, user_2, user_3];
    let count = 6;
    let amounts = [1000, 5000, 200, 1600, 2300, 1530];
    let totalAmount = 0;
    let numOfRests = restaurants.length;
    let numOfUsers = users.length;

    for (i = 0; i < count; i++) {
      let restId = restaurants[i % numOfRests];
      let userId = users[i % numOfUsers];
      totalAmount += amounts[i];
      await sendTransactions(userId, restId, amounts[i]);
    }

    await userFeedingSchema.updateMany({}, { $set: { fundingStatus: false } });

    let beforeFunding1 = await userFeedingSchema.find();

    let currentBalance = beforeFunding1.map((user) => {
        return user.balance
    });

    await fundWallet(token);

    let afterFunding2 = await userFeedingSchema.find();

    expect(afterFunding1[0].balance).toBe(30000);
    expect(afterFunding1[1].balance).toBe(45000);
    expect(afterFunding1[2].balance).toBe(45000);
    expect(afterFunding2[0].balance).toBe(currentBalance[0] + 30000);
    expect(afterFunding2[1].balance).toBe(currentBalance[1] + 45000);
    expect(afterFunding2[2].balance).toBe(currentBalance[2] + 45000);
  });
});
