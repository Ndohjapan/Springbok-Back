const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const config = require("config");


const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    number: { type: String, trim: true, unique: true },
    avatar: { type: String },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiresIn: { type: Date },
    role: {
      type: String,
      default: "user",
    },
    department: {type: String},
    level: {type: String},
    hostel: {type: String},
    matricNumber: {type: String},
    studentStatus: {
      type: Boolean,
      default: false
    }, 
    status: {
      type: String,
      enum: ["blocked", "active"],
      default: "active"
    },
    permissions: {
      type: [String],
      default: ["user"]
    }
  },
  { timestamps: true }
);
  

const userFeedingSchema = new mongoose.Schema({
    
    userId: {
        type: String,
        unique: true,
        ref: "user"
    },
    transactionPin: {
        type: String
    },
    balance: {
        type: Number,
        default: 0
    },
    previousBalance: {
        type: Number,
        default: 0
    },
    fundingStatus: {
      type: Boolean,
      default: false
    },
    feedingType: {
      type: Number,
      default: 2
    },
    lastFunding: {
      type: Date,
      default: new Date().toISOString()
    },
    studentStatus: {
      type: Boolean,
      default: false
    },
    totalAmountFunded: {
      type: Number,
      default: 0
    },
    numOfTimesFunded: {
      type: Number,
      default: 0
    },
    totalFeedingAmount: {
      type: Number,
      default: 0
    },
    amountLeft: {
      type: Number,
      default: 0
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
    avatar: { type: String, default: "https://oss.ban-qu.com/opportunity/startup3.png" },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["subAdmin", "bursar"],
      default: "subAdmin",
    },
    permissions: {
      type: [{type: String, enum: ["all", "fund wallet", "validate users", "create admin", "edit restaurant", "export csv", "view transactions",  "edit users"]}],
      default: []
    }, 
    status: {
      type: String,
      enum: ["blocked", "active"],
      default: "active"
    }
  },
  { timestamps: true }
)

const disbursementSchema = new mongoose.Schema({
amount: {
    type: Number,
    default: 0
},

numberOfStudents: {
    type: Number,
    default: 0
}


}, {timestamps: true})



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
      default:
        "https://res.cloudinary.com/billingshq/image/upload/v1646363586/springsbok/restaurant_qzb7vt.png",
    },
    balance: {
      type: Number,
      default: 0
    }, 
    previousBalance: {
      type: Number,
      default: 0
    },
    password: { type: String, required: true },
    email: { type: String, required: true, trim: true, unique: true },
    number: { type: String, trim: true, unique: true },
    permissions: {
      type: [String],
      default:  ["view transactions", "edit restaurant"]
    }
  },
  { timestamps: true }
);

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number
  },
  from:{
    type: String,
    ref: "user"
  },
  to: {
    type: String,
    ref: "Restaurants"
  }
}, {timestamps: true})

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
      type: [{type: String, enum: ["snacks", "food", "drinks", "protein", "others"]}],
      required: true
    }
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    
    orderId: {
        type: String,
        unique: true
    },
    restaurant: {
        type: String,
        ref: "Restaurants"
    },
    createdBy: {
        type: String,
        ref: "user"
    },
    totalAmount:{
        type: Number
    },
    food: [{
        food: {type: String, ref: 'Food'},
        amount: {
            type: Number
        }
    }],
    status: {
        type: String,
        enum: ["recieved", "sent", "completed", "processing"]
    }
  },
  { timestamps: true }
);

const utilsSchema = new mongoose.Schema({
  fundDate: {
    type: Number,
    default: 27
  },

  feedingAmount: {
    type: Number,
    default: 15000
  }, 

  newStudentAlert:{
    type: Number, 
    default: 0
  },
  
  unreadNotifications: {
    type: Number,
    default: 0
  },

  permissions: {
    type: [String],
    default: ["all", "fund wallet", "validate users", "create admin", "edit restaurant", "export csv", "view transactions",  "edit users"]
  }

}, {timestamps: true})

const activitySchema = new mongoose.Schema({
  by: {
    type: String,
    ref: "admins"
  },
  activity: {
    type: String
  },
  type: {
    type: String,
    enum: ["Update", "Create", "Login", "Delete"],
    default: "Update"
  }
}, {timestamps: true})


userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
      { id: this._id, verified: this.verified },
      config.get("jwtPrivateKey")
    );
};
  
userSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAuthToken = function () {
    return jwt.sign(
      { id: this._id, verified: this.verified },
      config.get("jwtPrivateKey")
    );
};  

adminSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.password);
};


restaurantSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, verified: this.verified },
    config.get("jwtPrivateKey")
  );
};  

restaurantSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.password);
};


userFeedingSchema.methods.checkPin = function (transactionPin) {
    return bcrypt.compare(transactionPin, this.transactionPin);
};


restaurantSchema.plugin(mongoosePaginate)
transactionSchema.plugin(mongoosePaginate)
foodSchema.plugin(mongoosePaginate)
userFeedingSchema.plugin(mongoosePaginate)
disbursementSchema.plugin(mongoosePaginate)
userSchema.plugin(mongoosePaginate)
adminSchema.plugin(mongoosePaginate)
activitySchema.plugin(mongoosePaginate)
  
module.exports.userSchema = mongoose.model("user", userSchema);
module.exports.adminSchema = mongoose.model("admins", adminSchema);
module.exports.activitySchema = mongoose.model("activity", activitySchema);
module.exports.userFeedingSchema = mongoose.model("user-feeding", userFeedingSchema);
module.exports.disbursementSchema = mongoose.model("disbursement", disbursementSchema);
module.exports.foodSchema = mongoose.model("Food", foodSchema);
module.exports.utilsSchema = mongoose.model("utils", utilsSchema);
module.exports.restaurantSchema = mongoose.model("Restaurants", restaurantSchema);
module.exports.orderSchema = mongoose.model("Order", orderSchema);
module.exports.transactionSchema = mongoose.model("transactions", transactionSchema)