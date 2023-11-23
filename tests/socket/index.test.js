const io = require('socket.io-client');
const http = require('http');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database")
const socketHandler = require('../../configs/socket');
const { serverSocketHandler } = require('../../sockets/index.socket');
const domainName = "http://localhost:4000"
const adminSocketTests = require("../socket/admin/admin.test")
let server;
let socket;
let corsOptions = {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept-Language'],
  },
}


beforeAll((done) => {
  server = http.createServer(app);
  const ioServer = require('socket.io')(server, corsOptions);
  socketHandler(ioServer);
  server.listen(4000, '0.0.0.0', done);
  socket = io(domainName);
});


describe('Socket.io Events', () => {
  adminSocketTests
});


afterAll(() => {
  mongoDB.disconnect();
  socket.close();
  server.close();
});
