const app = require("./app");
const http = require('http');
const socketIO = require('socket.io');
const socketHandler = require("./socket")


const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Authorization', 'Content-Type', "Accept-Language"]
    }
});
socketHandler(io)


server.listen(process.env.PORT || 4000, process.env.LOCAL_HOST || "0.0.0.0", () => {
    console.log(`Server is up and runing on port ${process.env.PORT}!`)
})


module.exports = app