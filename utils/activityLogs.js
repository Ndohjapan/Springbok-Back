const {activitySchema, utilsSchema} = require("../models/mainModel.js")



exports.success = async(...args) => {
    let activity = await activitySchema.create({by: args[0], activity: args[1], type: args[2]})
    activity = await activity.populate("by")
    await utilsSchema.updateMany({}, {$inc: {unreadNotifications: 1}})

}

exports.sendTransactionToRestaurant = async(...args) => {
    let socket = args[0]
    let restaurant = args[1].to
    socket.io.in(restaurant).emit('reciept', args[1])
}