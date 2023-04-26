const app = require("../app");
const request = require("supertest");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const {
  adminSchema,
  userSchema,
  tempoararyEmailSchema,
} = require("../models/mainModel");
const bcrypt = require("bcrypt");

const en = require("../locale/en/translation");
const { uploadFile } = require("../controllers/document");

beforeEach(async () => {
  await mongoose.connect("mongodb://localhost:27017/test1", {
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

jest.setTimeout(30000);

function isURL(str) {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return pattern.test(str);
}

const uploadProfileImage = async () => {
  const filePath = path.resolve(__dirname, "resources", "profile2.png");
  return await request(app)
    .post("/document/uploadDocument")
    .attach("document", filePath);
};

describe("Upload profile picture from the app", () => {
  it("returns 200 if file is properly uploaded", async () => {
    const response = await uploadProfileImage();

    expect(response.status).toBe(200);
  });

  it("returns status true and url field when upload is completed", async () => {
    const response = await uploadProfileImage();

    expect(response.body.status).toBeTruthy();
    expect(response.body.url).toBeTruthy();
  });

  it("returns a real url  when upload is completed", async () => {
    const response = await uploadProfileImage();

    const url = isURL(response.body.url);

    expect(url).toBeTruthy();
  });
});

describe("Upload the compiled CSV to Cloudinary", () => {
  it("returns status of 200 if the file is uploaded succesfully", async () => {
    const filePath = "Main-Royal-Cafeteria-2023-04-04.csv";

    let response = await uploadFile(filePath);

    expect(response.status).toBe(200);
  });

  it("returns successstatus true if the file is uploaded succesfully", async () => {
    const filePath = "Main-Royal-Cafeteria-2023-04-04.csv";

    let response = await uploadFile(filePath);

    expect(response.body.success).toBe(true);
  });

  it("returns a real url  when upload is completed", async () => {
    const filePath = "Main-Royal-Cafeteria-2023-04-04.csv";

    let response = await uploadFile(filePath);

    const url = isURL(response.body.url);

    expect(url).toBeTruthy();
  });
});
