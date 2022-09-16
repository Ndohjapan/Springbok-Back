const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    middlename: { type: String, trim: true, default: "" },
    email: { type: String, required: true, trim: true, unique: true },
    avatar: {
      type: String,
      default: "https://leadcity.s3.eu-west-2.amazonaws.com/1656238085089.png",
    },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiresIn: { type: Date },
    role: {
      type: String,
      default: "user",
    },
    department: { type: String },
    level: { type: String },
    hostel: { type: String },
    matricNumber: { type: String },
    studentStatus: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["blocked", "active"],
      default: "active",
    },
    permissions: {
      type: [String],
      default: ["user"],
    },
  },
  { timestamps: true }
);

const userFeedingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      ref: "user",
    },
    transactionPin: {
      type: String,
    },
    balance: {
      type: Number,
      default: 0,
    },
    previousBalance: {
      type: Number,
      default: 0,
    },
    fundingStatus: {
      type: Boolean,
      default: false,
    },
    feedingType: {
      type: Number,
      default: 2,
    },
    lastFunding: {
      type: Date,
      default: new Date().toISOString(),
    },
    studentStatus: {
      type: Boolean,
      default: false,
    },
    totalAmountFunded: {
      type: Number,
      default: 0,
    },
    numOfTimesFunded: {
      type: Number,
      default: 0,
    },
    totalFeedingAmount: {
      type: Number,
      default: 0,
    },
    amountLeft: {
      type: Number,
      default: 0,
    },
    lastFundingDay: {
      type: String,
      default: "2022-09-17"
    }
  },
  { timestamps: true }
);

const adminSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    number: { type: String, trim: true, unique: true },
    avatar: {
      type: String,
      default: "https://leadcity.s3.eu-west-2.amazonaws.com/1656238739061.png",
    },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["subAdmin", "bursar"],
      default: "subAdmin",
    },
    permissions: {
      type: [
        {
          type: String,
          enum: [
            "all",
            "fund wallet",
            "delete users",
            "invalidate users",
            "validate users",
            "create admin",
            "edit restaurant",
            "export csv",
            "view transactions",
            "edit users",
          ],
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ["blocked", "active"],
      default: "active",
    },
  },
  { timestamps: true }
);

const disbursementSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      default: 0,
    },

    numberOfStudents: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    numberOfFood: {
      type: Number,
      default: 0,
    },
    logo: {
      type: String,
      default: "https://leadcity.s3.eu-west-2.amazonaws.com/1656238457405.png",
    },
    balance: {
      type: Number,
      default: 0,
    },
    previousBalance: {
      type: Number,
      default: 0,
    },
    password: { type: String, required: true },
    email: { type: String, required: true, trim: true, unique: true },
    number: { type: String, trim: true, unique: true },
    permissions: {
      type: [String],
      default: ["view transactions", "edit restaurant"],
    },
  },
  { timestamps: true }
);

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
    },
    from: {
      type: String,
      ref: "user",
    },
    to: {
      type: String,
      ref: "Restaurants",
    },
    restaurantPreviousBalance: {
      type: Number,
      default: 0,
    },
    restaurantCurrentBalance: {
      type: Number,
      default: 0,
    },
    studentPreviousBalance: {
      type: Number,
      default: 0,
    },
    studentCurrentBalance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    servedWith: {
      type: String,
    },
    createdBy: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
    },
    tags: {
      type: [
        {
          type: String,
          enum: ["snacks", "food", "drinks", "protein", "others"],
        },
      ],
      required: true,
    },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    restaurant: {
      type: String,
      ref: "Restaurants",
    },
    createdBy: {
      type: String,
      ref: "user",
    },
    totalAmount: {
      type: Number,
    },
    food: [
      {
        food: { type: String, ref: "Food" },
        amount: {
          type: Number,
        },
      },
    ],
    status: {
      type: String,
      enum: ["recieved", "sent", "completed", "processing"],
    },
  },
  { timestamps: true }
);

const utilsSchema = new mongoose.Schema(
  {
    fundDate: {
      type: Number,
      default: 27,
    },

    feedingAmount: {
      type: Number,
      default: 15000,
    },

    newStudentAlert: {
      type: Number,
      default: 0,
    },

    unreadNotifications: {
      type: Number,
      default: 0,
    },

    permissions: {
      type: [String],
      default: [
        "all",
        "fund wallet",
        "delete users",
        "invalidate users",
        "validate users",
        "create admin",
        "edit restaurant",
        "export csv",
        "view transactions",
        "edit users",
      ],
    },

    levels: {
      type: [String],
      default: ["100", "200", "300", "400", "500", "PG", "Sandwich"],
    },

    hostels: {
      type: [String],
      default: [
        "Achievers Hostel",
        "Block C",
        "Block I",
        "Block L",
        "Block U",
        "Cam David 1",
        "Cam David 2",
        "Champions Hall",
        "Hibiscus Hall 1",
        "Hibiscus Hall 2",
        "Independence Hall",
        "Jackson Hall",
        "Peace Hall 1",
        "Peace Hall 2",
        "Proverbs Hall 1",
        "Proverbs Hall 2",
        "Revelation Hall 1",
        "Revelation Hall 2",
        "Wisdom Hall",
      ],
    },

    departments: {
      type: [String],
      default: [
        "B. A English & Literary Studies",
        "B. NSc.  Nursing",
        "B. Sc. Business Administration",
        "B. Sc. Health Education & Promotion",
        "B.A (Ed.) English",
        "B.A. Performing Arts & Film Studies",
        "B.Ed. Business Education",
        "B.Ed. Educational Administration",
        "B.Ed. Guidance & Counselling",
        "B.Ed. Social Studies",
        "B.MLS. Medical Laboratory Science",
        "B.Sc Forensic Science",
        "B.Sc Radiography",
        "B.Sc.  Architecture",
        "B.Sc.  Microbiology",
        "B.Sc. Anatomy",
        "B.Sc. Banking and Finance",
        "B.Sc. Biochemistry",
        "B.Sc. Biological Sciences",
        "B.Sc. Biology",
        "B.Sc. Business Computing",
        "B.Sc. Chemistry",
        "B.Sc. Community Health",
        "B.Sc. Computer and Information Science",
        "B.Sc. Computer Science with Economics",
        "B.Sc. Computer Science with Electronics",
        "B.Sc. Computer Science",
        "B.Sc. Criminology",
        "B.Sc. Economics and Development Studies",
        "B.Sc. Ed. Biology",
        "B.Sc. Ed. Chemistry",
        "B.Sc. Ed. Computer Science",
        "B.Sc. Ed. Mathematics",
        "B.Sc. Ed. Physical Education",
        "B.Sc. Ed. Physics",
        "B.Sc. Entrepreneurship",
        "B.Sc. Environmental Health Science",
        "B.Sc. Environmental Management & Toxicology",
        "B.Sc. Health Education",
        "B.Sc. Health Information Management",
        "B.Sc. Information & Communication Technology",
        "B.Sc. International Law and Diplomacy",
        "B.Sc. International Politics and Diplomacy",
        "B.Sc. International Relations",
        "B.Sc. Kinesiology & Sports Science",
        "B.Sc. Management and Accounting",
        "B.Sc. Marketing",
        "B.Sc. Mass Communication",
        "B.Sc. Nutrition & Dietetics",
        "B.Sc. Peace and Conflict Studies",
        "B.Sc. Pharmacy",
        "B.Sc. Physics",
        "B.Sc. Physiology",
        "B.Sc. Political Philosophy",
        "B.Sc. Politics and International Relations",
        "B.Sc. Politics",
        "B.Sc. Psychology",
        "B.Sc. Public Administration",
        "B.Sc. Public Health",
        "B.Sc. Science Laboratory Technology",
        "B.Sc. Science Laboratory Technology",
        "B.Sc. Social Work",
        "B.Sc. Sociology",
        "B.Sc. Software Engineering",
        "B.Sc. War and Strategic Studies",
        "Bachelor of Laws (LLB.)",
        "Law and Gender",
      ],
    },

    feedingPlanLimits: {
      twoMeals: {
        type: Number,
        default: 7000,
      },
      threeMeals: {
        type: Number,
        default: 10500,
      },
    },
  },
  { timestamps: true }
);

const activitySchema = new mongoose.Schema(
  {
    by: {
      type: String,
      ref: "admins",
    },
    activity: {
      type: String,
    },
    type: {
      type: String,
      enum: ["Update", "Create", "Login", "Delete"],
      default: "Update",
    },
  },
  { timestamps: true }
);

const recordsSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    numberOfStudents:{
      type: Number,
      default: 0
    },
    amountDisbursed: {
      type: Number,
      default: 0
    },
    amountSpent: {
      type: Number,
      default: 0
    },
    totalTransactions: {
      type: Number,
      default: 0
    },
    restaurants :{
      type: [{type: Object}]
    },
    from: String,
    to: String,
    days: Number
  },
  {timestamps: true}
)

const errorSchema = new mongoose.Schema(
  {
    message: {
      type: String,
    },
    device: {
      type: String,
    },
    ip: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, verified: this.verified },
    process.env.jwtPrivateKey
  );
};

userSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, verified: this.verified },
    process.env.jwtPrivateKey
  );
};

adminSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

restaurantSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, verified: this.verified },
    process.env.jwtPrivateKey
  );
};

restaurantSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userFeedingSchema.methods.checkPin = function (transactionPin) {
  return bcrypt.compare(transactionPin, this.transactionPin);
};

restaurantSchema.plugin(mongoosePaginate);
transactionSchema.plugin(mongoosePaginate);
foodSchema.plugin(mongoosePaginate);
userFeedingSchema.plugin(mongoosePaginate);
disbursementSchema.plugin(mongoosePaginate);
userSchema.plugin(mongoosePaginate);
adminSchema.plugin(mongoosePaginate);
activitySchema.plugin(mongoosePaginate);
errorSchema.plugin(mongoosePaginate);
recordsSchema.plugin(mongoosePaginate);

module.exports.userSchema = mongoose.model("user", userSchema);
module.exports.adminSchema = mongoose.model("admins", adminSchema);
module.exports.activitySchema = mongoose.model("activity", activitySchema);
module.exports.userFeedingSchema = mongoose.model(
  "user-feeding",
  userFeedingSchema
);
module.exports.disbursementSchema = mongoose.model(
  "disbursement",
  disbursementSchema
);
module.exports.foodSchema = mongoose.model("Food", foodSchema);
module.exports.utilsSchema = mongoose.model("utils", utilsSchema);
module.exports.restaurantSchema = mongoose.model(
  "Restaurants",
  restaurantSchema
);
module.exports.orderSchema = mongoose.model("Order", orderSchema);
module.exports.errorSchema = mongoose.model("Errors", errorSchema);
module.exports.recordsSchema = mongoose.model("Records", recordsSchema);
module.exports.transactionSchema = mongoose.model(
  "transactions",
  transactionSchema
);
