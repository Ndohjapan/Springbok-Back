const app = require("../app");
const request = require("supertest");
const mongoose = require("mongoose");
const {
  adminSchema,
  userSchema,
  tempoararyEmailSchema,
} = require("../models/mainModel");
const bcrypt = require("bcrypt");
const emailService = require("../utils/sendMail");
const en = require("../locale/en/translation");

const admin = {
  firstname: "Joel",
  lastname: "Ndoh",
  email: "ndohjoel2@ban-qu.com",
  number: "09056144059",
  password: "12345678",
  verified: true,
  role: "bursar",
  permissions: ["all"],
};

const user = {
  firstname: "Joel",
  lastname: "Ndoh",
  middlename: "Chibueze",
  email: "ndohjoelmbj16@gmail.com",
  password: "12345678",
  studentStatus: true,
  status: "active",
};

let token;

jest.mock("../utils/sendMail");

beforeAll(async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(admin.password, salt);

  admin.password = hashedPassword;
  user.password = hashedPassword;
});

beforeEach(async () => {
  await mongoose.connect("mongodb://localhost:27017/test4", {
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

const createAdminAndLogin = async () => {
  await adminSchema.create(admin);
  const response = await request(app)
    .post("/api/v1/users/adminSignin")
    .send({ email: admin.email, password: "12345678" });

  return response.body.token;
};

const createUser = async () => {
  await userSchema.create(user);
};

const sendOtpTochangeEmail = async (email, token) => {
  await createUser();
  const agent = request(app).post("/dashboard/sendOtpToNewEmail");

  agent.set("x-auth-token", token);

  return await agent.send({ email });
};

const confirmOtpAndChangeEmail = async (oldEmail, newEmail, otp, token) => {
  const agent = request(app).post("/dashboard/confirmOtpAndChangeEmail");

  agent.set("x-auth-token", token);

  return await agent.send({ oldEmail, newEmail, otp });
};

describe("Change Email", () => {
  it("returns 400 if the email new email is already in the database", async () => {
    const token = await createAdminAndLogin();

    const response = await sendOtpTochangeEmail(user.email, token);

    expect(response.status).toBe(400);
  });

  it("returns error message of new email is already in the database if we try to use an email that is already in the database", async () => {
    const token = await createAdminAndLogin();

    const response = await sendOtpTochangeEmail(user.email, token);

    expect(response.body.error).toBe(en.email_already_in_use);
  });

  it("Send Otp to user ", async () => {
    const token = await createAdminAndLogin();
    const mockSendEmail = jest
      .spyOn(emailService, "sendMail")
      .mockResolvedValueOnce({ message: "Email Sent to the user" });

    const response = await sendOtpTochangeEmail(
      "ndohjoel2018@gmail.com",
      token
    );
    const tempEmailInDb = await tempoararyEmailSchema.find({
      email: "ndohjoel2018@gmail.com",
    });
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(tempEmailInDb.length).toBe(1);
    mockSendEmail.mockRestore();
  });

  it("check if the otp was actually stored in the database after it was sent to the users email", async () => {
    const token = await createAdminAndLogin();
    const mockSendEmail = jest
      .spyOn(emailService, "sendMail")
      .mockResolvedValueOnce({ message: "Email Sent to the user" });

    const response = await sendOtpTochangeEmail(
      "ndohjoel2018@gmail.com",
      token
    );
    const tempEmailInDb = await tempoararyEmailSchema.find({
      email: "ndohjoel2018@gmail.com",
    });
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(tempEmailInDb.length).toBe(1);
    expect(tempEmailInDb[0].otp).toBeTruthy();
    expect(tempEmailInDb[0].email).toBeTruthy();
    expect(tempEmailInDb[0].otpExpiresIn).toBeTruthy();
    mockSendEmail.mockRestore();
  });

  it("returns 400 when the otp is invalid", async () => {
    const token = await createAdminAndLogin();
    const mockSendEmail = jest
      .spyOn(emailService, "sendMail")
      .mockResolvedValueOnce({ message: "Email Sent to the user" });

    await sendOtpTochangeEmail("ndohjoel2018@gmail.com", token);
    const tempEmailInDb = await tempoararyEmailSchema.find({
      email: "ndohjoel2018@gmail.com",
    });

    const invalidOTP = "1234" !== tempEmailInDb[0].otp ? "1234" : "5678";

    const response = await confirmOtpAndChangeEmail(
      user.email,
      "ndohjoel2018@gmail.com",
      invalidOTP,
      token
    );

    expect(response.status).toBe(400);
    mockSendEmail.mockRestore();
  });

  it("returns invalid otp message when the otp is invalid", async () => {
    const token = await createAdminAndLogin();
    const mockSendEmail = jest
      .spyOn(emailService, "sendMail")
      .mockResolvedValueOnce({ message: "Email Sent to the user" });

    await sendOtpTochangeEmail("ndohjoel2018@gmail.com", token);
    const tempEmailInDb = await tempoararyEmailSchema.find({
      email: "ndohjoel2018@gmail.com",
    });

    const invalidOTP = "1234" !== tempEmailInDb[0].otp ? "1234" : "5678";

    const response = await confirmOtpAndChangeEmail(
      user.email,
      "ndohjoel2018@gmail.com",
      invalidOTP,
      token
    );

    expect(response.body.error).toBe(en.invalid_otp);
    mockSendEmail.mockRestore();
  });

  it("returns 400 if the otp has expired", async () => {
    const fifteenMinutesAgo = new Date(new Date().getTime() - (15 * 60 * 1000));

    const token = await createAdminAndLogin();
    const mockSendEmail = jest
      .spyOn(emailService, "sendMail")
      .mockResolvedValueOnce({ message: "Email Sent to the user" });

    await sendOtpTochangeEmail("ndohjoel2018@gmail.com", token);

    
    const tempEmailInDb = await tempoararyEmailSchema.findOneAndUpdate({
        email: "ndohjoel2018@gmail.com",
    }, {$set: {otpExpiresIn: fifteenMinutesAgo}}, {new: true});
    

    const response = await confirmOtpAndChangeEmail(
      user.email,
      "ndohjoel2018@gmail.com",
      tempEmailInDb.otp,
      token
    );

    expect(response.status).toBe(400)
    mockSendEmail.mockRestore();

  });

  it("returns error message 'otp has expired 'if the otp has expired", async () => {
    const fifteenMinutesAgo = new Date(new Date().getTime() - (15 * 60 * 1000));

    const token = await createAdminAndLogin();
    const mockSendEmail = jest
      .spyOn(emailService, "sendMail")
      .mockResolvedValueOnce({ message: "Email Sent to the user" });

    await sendOtpTochangeEmail("ndohjoel2018@gmail.com", token);

    
    const tempEmailInDb = await tempoararyEmailSchema.findOneAndUpdate({
        email: "ndohjoel2018@gmail.com",
    }, {$set: {otpExpiresIn: fifteenMinutesAgo}}, {new: true});
    

    const response = await confirmOtpAndChangeEmail(
      user.email,
      "ndohjoel2018@gmail.com",
      tempEmailInDb.otp,
      token
    );

    expect(response.body.error).toBe(en.expired_otp)
    mockSendEmail.mockRestore();

  });

  it("Change the email of the account", async () => {
    const token = await createAdminAndLogin();
    const mockSendEmail = jest
      .spyOn(emailService, "sendMail")
      .mockResolvedValueOnce({ message: "Email Sent to the user" });

    await sendOtpTochangeEmail("ndohjoel2018@gmail.com", token);
    const tempEmailInDb = await tempoararyEmailSchema.find({
      email: "ndohjoel2018@gmail.com",
    });

    const response = await confirmOtpAndChangeEmail(
      user.email,
      "ndohjoel2018@gmail.com",
      tempEmailInDb[0].otp,
      token
    );

    const userInDb = await userSchema.find({});

    expect(response.status).toBe(200);
    expect(userInDb[0].email).not.toBe(user.email);
    expect(userInDb[0].email).toBe("ndohjoel2018@gmail.com");
    mockSendEmail.mockRestore();
  });

  it("Ensure that their is no other user with that old email in the database after you have chnaged the mail to the new one", async () => {
    const token = await createAdminAndLogin();
    const mockSendEmail = jest
      .spyOn(emailService, "sendMail")
      .mockResolvedValueOnce({ message: "Email Sent to the user" });

    await sendOtpTochangeEmail("ndohjoel2018@gmail.com", token);
    const tempEmailInDb = await tempoararyEmailSchema.find({
      email: "ndohjoel2018@gmail.com",
    });

    const response = await confirmOtpAndChangeEmail(
      user.email,
      "ndohjoel2018@gmail.com",
      tempEmailInDb[0].otp,
      token
    );

    const userInDb = await userSchema.exists({email: user.email});

    expect(userInDb).toBeFalsy()
    mockSendEmail.mockRestore();
  });

  it('confirm that the new emil also deleted from the tempoarary email collection after the email has been changed', async() => {
    const token = await createAdminAndLogin();
    const mockSendEmail = jest
      .spyOn(emailService, "sendMail")
      .mockResolvedValueOnce({ message: "Email Sent to the user" });

    await sendOtpTochangeEmail("ndohjoel2018@gmail.com", token);
    const tempEmailInDb = await tempoararyEmailSchema.find({
      email: "ndohjoel2018@gmail.com",
    });

    const response = await confirmOtpAndChangeEmail(
      user.email,
      "ndohjoel2018@gmail.com",
      tempEmailInDb[0].otp,
      token
    );

    const emailInDB = await tempoararyEmailSchema.find({})

    expect(emailInDB.length).toBe(0)
    
    mockSendEmail.mockRestore();
  })
});
