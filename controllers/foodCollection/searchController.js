const {userSchema, restaurantSchema, recordsSchema, userFeedingSchema} = require("../../models/mainModel")
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const bcrypt = require("bcrypt")
const {success} = require("../../utils/activityLogs")


exports.userSearch = catchAsync(async(req, res, next) => {
    if(req.body.query) {
        const regex = new RegExp(escapeRegex(req.body.query), 'gi');
        // Get all campgrounds from DB

        const options = {
          sort: { createdAt: -1 },
          populate: ["userId"],
          pagination: false

        };

        let usersAggregate = [
          {
            "$match": {
              $or:[
                {firstname: regex}, 
                {lastname: regex}, 
                {middlename: regex}, 
                {matricNumber: regex}, 
                {email: regex}
              ], 
              verified: true
            }
          },
          {
            "$group": {
              _id: null,
              userIds: {
                "$push": "$_id"
              }
            }
          }

        ]

        let users = await userSchema.aggregate(usersAggregate)
        if(!users.length){
          return res.status(200).send({ status: true, message: "Successful", payload: []})

        }
        
        userFeedingSchema.paginate({userId: {$in: users[0].userIds}},
            options,
            function (err, result) {
              if (err) {
                console.log(err);
                res.status(400).send(err);
              } else {
                return res
                  .status(200)
                  .send({ status: true, message: "Successful", payload: result.docs });
              }
            }
          );
        
    } else {
        fail(res, "Invalid Parameter")
    }
})


exports.validatedUserSearch = catchAsync(async(req, res, next) => {
  if(req.body.query) {
      const regex = new RegExp(escapeRegex(req.body.query), 'gi');
      // Get all campgrounds from DB

      const options = {
        sort: { createdAt: -1 },
        populate: ["userId"],
        pagination: false

      };

      let usersAggregate = [
        {
          "$match": {
            $or:[
              {firstname: regex}, 
              {lastname: regex}, 
              {middlename: regex}, 
              {matricNumber: regex}, 
              {email: regex}
            ], 
            verified: true,
            studentStatus: true
          }
        },
        {
          "$group": {
            _id: null,
            userIds: {
              "$push": "$_id"
            }
          }
        }

      ]

      let users = await userSchema.aggregate(usersAggregate)
      if(!users.length){
        return res.status(200).send({ status: true, message: "Successful", payload: []})

      }
      
      userFeedingSchema.paginate({userId: {$in: users[0].userIds}},
          options,
          function (err, result) {
            if (err) {
              console.log(err);
              res.status(400).send(err);
            } else {
              return res
                .status(200)
                .send({ status: true, message: "Successful", payload: result.docs });
            }
          }
        );
      
  } else {
      fail(res, "Invalid Parameter")
  }
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



