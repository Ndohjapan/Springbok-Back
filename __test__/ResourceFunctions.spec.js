const app = require("../app");
const request = require("supertest");
const mongoose = require("mongoose");
const mockData = require("./resources/mockdata.json");
const {
  createAdminAndLogin,
  createUser,
  userLogin,
  createRestaurants,
  multiTransactions,
  sendTransactions,
} = require("./resources/functions");
const {
  userSchema,
  adminSchema,
  userFeedingSchema,
  restaurantSchema,
  restaurantTransactionsSchema,
  transactionSchema,
} = require("../models/mainModel");
const en = require("../locale/en/translation");

let admin1 = mockData.admin1;
let user1 = mockData.user1;
let user2 = mockData.user2;
let res1 = mockData.restaurant1;

beforeEach(async () => {
  await mongoose.connect("mongodb://localhost:27017/test2", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  } catch (error) {
    return true;
  }
});

describe("Check if user is created properly for test", () => {
  it("create a user and validate the user", async () => {
    await createUser(user1);
    const userInDb = await userSchema.find({});
    const userFeedingInDB = await userSchema.find({});

    expect(userInDb[0].verified).toBeTruthy();
    expect(userInDb[0].studentStatus).toBeTruthy();
    expect(userFeedingInDB[0].studentStatus).toBeTruthy();
  });

  it("create an invalidated user", async () => {
    await createUser(user1, false);
    const userInDb = await userSchema.find({});
    const userFeedingInDB = await userSchema.find({});

    expect(userInDb[0].studentStatus).toBeFalsy();
    expect(userFeedingInDB[0].studentStatus).toBeFalsy();
  });

  it("confirm if the password and transaction pin of the user are correct", async () => {
    const { user, userFeding } = await createUser(user1, false);

    const passwordCheck = await user.checkPassword("12345678");
    const pinCheck = await userFeding.checkPin("1234");

    expect(passwordCheck).toBeTruthy();
    expect(pinCheck).toBeTruthy();
  });

  it("create a valid user and give some default data and check if it was set properly", async () => {
    await createUser(user1, true, 270000, true, 2, 3, 90000);

    const userFeedingInDB = await userFeedingSchema.find({});

    expect(userFeedingInDB[0].studentStatus).toBeTruthy();
    expect(userFeedingInDB[0].feedingType).toBe(2);
    expect(userFeedingInDB[0].numOfTimesFunded).toBe(3);
    expect(userFeedingInDB[0].totalAmountFunded).toBe(90000);
    expect(userFeedingInDB[0].amountLeft).toBe(270000);
    expect(userFeedingInDB[0].totalFeedingAmount).toBe(270000);
    expect(userFeedingInDB[0].balance).toBe(0);
    expect(userFeedingInDB[0].numOfTimesFunded).toBe(3);
  });

  it("login with a created valid user", async () => {
    await createUser(user1);
    const { token, response } = await userLogin(user1.email, app);

    expect(response.status).toBe(200);
    expect(token).toBeTruthy();
  });
});

describe("Check if restaurants are created properly", () => {
  it("creats the restaurants", async () => {
    await createRestaurants();

    const restaurantInDb = await restaurantSchema.find({});
    const restaurantDetails = await restaurantTransactionsSchema.find({});

    expect(restaurantInDb.length).toBe(3);
    expect(restaurantDetails.length).toBe(3);
    expect(restaurantDetails[0].restaurantName).toBe(res1.name);
  });
});

describe("Do Transactions", () => {
  it("check if single transaction is saved to database", async () => {
    const { user } = await createUser(user1, true, 270000);
    const { rest1 } = await createRestaurants();

    await sendTransactions(user.id, rest1, 500);

    const transactionInDb = await transactionSchema.find({});
    const restaurantInDb = await restaurantSchema.findById(rest1);
    const userFeedingInDb = await userFeedingSchema.findOne({
      userId: user.id,
    });
    const restaurantDetails = await restaurantTransactionsSchema.findOne({
      restuarantId: rest1,
    });

    expect(transactionInDb.length).toBe(1);
    expect(transactionInDb[0].from).toBe(user.id);
    expect(transactionInDb[0].to).toBe(rest1);
    expect(restaurantDetails.totalTransactions).toBe(1);
    expect(restaurantDetails.totalTransactionsAmount).toBe(500);
    expect(restaurantInDb.balance).toBe(500);
    expect(userFeedingInDb.balance).toBe(-500);
  });

  it("do a bulk transaction and check if they are all saved in database", async () => {
    const { user } = await createUser(user1, true, 270000);
    const { rest1, rest2 } = await createRestaurants();

    let restaurants = [rest1, rest2];
    let count = 3;
    let amounts = [1000, 300, 200];
    let numOfRests = restaurants.length;
    
    for (i = 0; i < count; i++) {
      let restId = restaurants[i % numOfRests];
      await sendTransactions(user.id, restId, amounts[i]);
    }

    const transactionInDb = await transactionSchema.find({});
    const restaurantInDb1 = await restaurantSchema.findById(rest1);
    const restaurantInDb2 = await restaurantSchema.findById(rest2);
    const userFeedingInDb = await userFeedingSchema.findOne({
      userId: user.id,
    });
    const restaurantDetails1 = await restaurantTransactionsSchema.findOne({
      restaurantId: rest1,
    });
    const restaurantDetails2 = await restaurantTransactionsSchema.findOne({
      restaurantId: rest2,
    });

    expect(transactionInDb.length).toBe(3);
    expect(restaurantDetails1.totalTransactions).toBe(2);
    expect(restaurantDetails1.totalTransactionsAmount).toBe(1200);
    expect(restaurantDetails2.totalTransactions).toBe(1);
    expect(restaurantDetails2.totalTransactionsAmount).toBe(300);
    expect(restaurantInDb1.balance).toBe(1200);
    expect(restaurantInDb2.balance).toBe(300);
    expect(userFeedingInDb.balance).toBe(-1500);
  });
});


describe("Check if the admin is created properly for test", () => {
  it("create an admin", async () => {
    await createAdminAndLogin(admin1, app);
    const adminInDb = await adminSchema.find({});

    expect(adminInDb.length).toBe(1);
  });

  it("confirm if the password of the admin is correct", async () => {
    const { admin } = await createAdminAndLogin(admin1, app);

    const passwordCheck = await admin.checkPassword("12345678");

    expect(passwordCheck).toBeTruthy();
  });
});
