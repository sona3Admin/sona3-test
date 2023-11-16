
exports.customerSocketHandler = (socket, io, socketId, localeMessages) => {


    socket.on("joinCustomerRoom", (dataObject, sendAck) => {
        try {
            socket.join(dataObject.customerId);
            return sendAck({
                success: true,
                code: 200,
                result: { roomId: dataObject.customerId }
            })

        } catch (err) {
            console.log(`err.message`, err.message);
            return io.to(socketId).emit("error", {
                success: false,
                code: 500,
                error: localeMessages.internalServerError
            })

        }

    })


    socket.on("revokeCustomerAccess", (dataObject, sendAck) => {
        try {
            let targetRoom = dataObject.customerId
            io.to(targetRoom).emit("forceLogout");
            return sendAck({
                success: true,
                code: 200,
                result: { firedEvent: "forceLogout" }
            })

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