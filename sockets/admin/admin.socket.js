
exports.adminSocketHandler = (socket, io, socketId, localeMessages) => {


    socket.on("joinAdminRoleRoom", (dataObject, sendAck) => {
        try {
            socket.join(dataObject.roleId);
            return sendAck({
                success: true,
                code: 200,
                result: { roomId: dataObject.roleId }
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


    socket.on("revokeAdminAccess", (dataObject, sendAck) => {
        try {
            let targetRoom = dataObject.roleId
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