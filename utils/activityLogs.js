const {activitySchema, utilsSchema} = require("../models/mainModel.js")



exports.success = async(...args) => {
    let socket = args[2]
    let activity = await activitySchema.create({by: args[0], activity: args[1]})
    activity = await activity.populate("by")
    socket.emit("listen", activity);

    await utilsSchema.updateMany({}, {$inc: {unreadNotifications: 1}})

}