const { serverSocketHandler } = require("../sockets/index.socket")

let websocketServer = (io) => {
    try {
        io.on('connection', (socket) => { serverSocketHandler(socket, io) })

    } catch (err) {
        return console.log(`err.message`, err.message);
    }


}


module.exports = websocketServer