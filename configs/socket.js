const { serverSocketHandler } = require("../sockets/index.socket")
let { verifyTokenInSocket } = require("../helpers/jwt.helper")

let websocketServer = (io) => {
    try {
        io.on('connection', async (socket) => {
            const userId = socket.handshake.headers['_id'] || socket.handshake.auth['_id']
            const userToken = socket.handshake.headers['token'] || socket.handshake.auth['token']
            const userRole = socket.handshake.headers['role'] || socket.handshake.auth['role']
            // console.log("user id: ", userId)
            // console.log("user token: ", userToken)
            // console.log("user role: ", userRole)
            let authenticationResult = await verifyTokenInSocket(userToken, userRole)
            if (!authenticationResult.success) return socket.disconnect(true);
            if (!userId || authenticationResult.result._id !== userId) return socket.disconnect(true);
            socket.socketTokenData = authenticationResult.result
            socket.join(userId)
            // console.log("socketId", socket.id)
            serverSocketHandler(socket, io)
        })

    } catch (err) {
        return console.log(`err.message`, err.message);
    }


}


module.exports = websocketServer