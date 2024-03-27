const { serverSocketHandler } = require("../sockets/index.socket")
let { verifyTokenInSocket } = require("../helpers/jwt.helper")

let websocketServer = (io) => {
    try {
        io.on('connection', (socket) => {
            const userId = socket.handshake.headers['_id']
            const userToken = socket.handshake.headers['token']
            const userRole = socket.handshake.headers['role']
            let authenticationResult = verifyTokenInSocket(userToken, userRole)
            if(!authenticationResult.success) return socket.disconnect(true);
            if(!userId || authenticationResult.result._id !== userId) return socket.disconnect(true);
            
            socket.join(userId)
            console.log("socketId", socket.id)
            serverSocketHandler(socket, io)
        })

    } catch (err) {
        return console.log(`err.message`, err.message);
    }


}


module.exports = websocketServer