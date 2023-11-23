const io = require('socket.io-client');
const http = require('http');
const app = require('../../../configs/app');
const mongoDB = require("../../../configs/database")
const socketHandler = require('../../../configs/socket');
const { serverSocketHandler } = require('../../../sockets/index.socket');
const domainName = "http://localhost:4000"
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

  test('Join Admin Role Room', (done) => {
    const dataObject = { roleId: 'adminRoom' };
    socket.emit('joinAdminRoleRoom', dataObject, (response) => {
      expect(response.success).toBe(true);
      expect(response.code).toBe(200);
      expect(response.result.roomId).toBe(dataObject.roleId);
      done();
    });
  });


});


afterAll(() => {
  mongoDB.disconnect();
  socket.close();
  server.close();
});
