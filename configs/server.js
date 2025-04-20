const app = require("./app");
const http = require('http');
const socketIO = require('socket.io');
const socketHandler = require("./socket")
const { logInTestEnv } = require("../helpers/logger.helper");


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
    logInTestEnv(`Server is up and running on port ${process.env.PORT}!`)
})


module.exports = app