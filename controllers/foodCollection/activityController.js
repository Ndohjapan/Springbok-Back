const {activitySchema, utilsSchema} = require("../../models/mainModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const {success} = require("../../utils/activityLogs")
    

exports.getAllActivity = catchAsync(async (req, res, next) => {
    let page = req.query.page ? req.query.page : 1
    let limit = req.query.limit ? req.query.limit : 50

    const options = {
        page: page,
        limit: limit,
        sort: {"createdAt": -1},
        populate: ["by"]
    };

    activitySchema.paginate({}, options, function(err, result) {
        if(err){
            return next(new AppError(err.message, 400));
        }else{
            res.status(200).send({status: true, message: "Successful", data: result.docs})
            return utilsSchema.updateMany({}, {$set: {unreadNotifications: 0}})
        }
    })

});

exports.getActivity = catchAsync(async (req, res, next) => {
    const activity = await activitySchema.findById(req.params.id).populate(["by"])
    return res.status(200).send({ status: true, message: "Successful", data: activity });
});


exports.deleteActivity = catchAsync(async (req, res, next) => {
    const socket = req.app.get("socket");
    let userId = req.user["_id"].toString()
    await activitySchema.findByIdAndDelete(req.params.id);
    res.status(200).send({ status: true, message: "Activity Deleted" });

    success(userId, ` deleted an activity log`, socket)
});

