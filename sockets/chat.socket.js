const roomRepo = require("../modules/Room/room.repo")


exports.chatSocketHandler = (socket, io, socketId, localeMessages) => {

    socket.on("joinRoom", async (dataObject, sendAck) => {
        try {
            let roomObject = await roomRepo.find(dataObject)
            if (!roomObject.success) roomObject = await roomRepo.create({ ...dataObject, lastMessage: {} })
            socket.join(roomObject.result._id.toString());
            console.log(socketId, " joined room: ", roomObject.result._id.toString());
            return sendAck(roomObject)

        } catch (err) {
            console.log(`err.message`, err.message);
            return io.to(socketId).emit("error", {
                success: false,
                code: 500,
                error: localeMessages.internalServerError
            })
        }
    })


    socket.on("sendMessage", async (dataObject, sendAck) => {
        try {
            const existingObject = await roomRepo.find({ _id: dataObject.roomId })
            if (!existingObject.success || existingObject.result.isBlocked) return sendAck({
                code: 409,
                success: false,
                error: localeMessages.roomBlocked
            })

            let resultObject = await roomRepo.updateDirectly(dataObject.roomId, {
                $push: { messages: dataObject.message },
                lastMessage: dataObject.message,
                lastDate: dataObject.message.timestamp
            })

            socket.join(dataObject.roomId);
            console.log(socketId, " joined room: ", dataObject.roomId);
            io.to(dataObject.roomId).emit("newMessage", { success: true, code: 201, result: dataObject.message })
            return sendAck(resultObject)

        } catch (err) {
            console.log(`err.message`, err.message);
            return io.to(socketId).emit("error", {
                success: false,
                code: 500,
                error: localeMessages.internalServerError
            })

        }

    })

}