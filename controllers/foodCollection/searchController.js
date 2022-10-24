const {userSchema, restaurantSchema, recordsSchema} = require("../../models/mainModel")
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
        };

        userSchema.paginate(
            {$or:[{firstname: regex}, {lastname: regex}, {middlename: regex}, {matricNumber: regex}, {email: regex}], verified: true},
            options,
            function (err, result) {
              if (err) {
                console.log(err);
                res.status(400).send(err);
              } else {
                res
                  .status(200)
                  .send({ status: true, message: "Successful", payload: result.docs });
              }
            }
          );

        // let users = userSchema.find({$or:[{firstname: regex}, {lastname: regex}, {middlename: regex}]}, ['_id', 'name', 'avatar', 'bio'])
        // let promises = [users]

        // Promise.all(promises).then(results => {
        //     success(res, {users: results[0], communities: results[1]})
        // })
    } else {
        fail(res, "Invalid Parameter")
    }
})


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



