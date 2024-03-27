const { getSettings } = require("../helpers/settings.helper")


exports.adminSocketHandler = (socket, io, socketId, localeMessages) => {

    try {
        socket.on("joinAdminsRoom", (dataObject, sendAck) => {
            const adminId = dataObject._id
            const adminsRoomId = getSettings("adminsRoomId")
            socket.join(adminsRoomId.toString())
            sendAck({ success: true, code: 200 })
        })
        
    } catch (err) {
        console.log("err.message", err.message)
        sendAck({ success: false, code: 500, error: localeMessages.internalServerError })

    }

}