const { serverSocketHandler } = require("../sockets/index.socket")

let websocketServer = (io) => {
    try {
        io.on('connection', (socket) => {
            const userId = socket.handshake.headers['_id']
            if (userId) socket.join(userId)
            console.log("socketId", socket.id)
            serverSocketHandler(socket, io)
        })

    } catch (err) {
        return console.log(`err.message`, err.message);
    }


}


module.exports = websocketServer