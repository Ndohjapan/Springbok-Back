const {activitySchema, utilsSchema} = require("../models/mainModel.js")



exports.success = async(...args) => {
    let socket = args[3]
    let activity = await activitySchema.create({by: args[0], activity: args[1], type: args[2]})
    activity = await activity.populate("by")
    await utilsSchema.updateMany({}, {$inc: {unreadNotifications: 1}})
    socket.emit("listen", activity);


}