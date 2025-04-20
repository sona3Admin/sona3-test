const { serverSocketHandler } = require("../sockets/index.socket")
let { verifyTokenInSocket } = require("../helpers/jwt.helper")
const { setSocketIo } = require("../configs/socketManager")
const { logInTestEnv } = require("../helpers/logger.helper");

let websocketServer = (io) => {
    try {
        io.on('connection', async (socket) => {
            const userId = socket.handshake.headers['_id'] || socket.handshake.auth['_id']
            const userToken = socket.handshake.headers['token'] || socket.handshake.auth['token']
            const userRole = socket.handshake.headers['role'] || socket.handshake.auth['role']
            // logInTestEnv("user id: ", userId)
            // logInTestEnv("user token: ", userToken)
            // logInTestEnv("user role: ", userRole)
            let authenticationResult = await verifyTokenInSocket(userToken, userRole)
            if (!authenticationResult.success) return socket.disconnect(true);
            if (!userId || authenticationResult.result._id !== userId) return socket.disconnect(true);
            socket.socketTokenData = authenticationResult.result
            socket.join(userId)
            // logInTestEnv("socketId", socket.id)
            serverSocketHandler(socket, io)
        })
        setSocketIo(io);


    } catch (err) {
        return logInTestEnv(`err.message`, err.message);
    }


}


module.exports = websocketServer