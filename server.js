const WebSocket = require('ws');
const monitorarAssociation = require('./monitor/associationMonitor');
const monitorarAuthentication = require('./monitor/authenticationMonitor');
const monitorarHandshake = require('./monitor/handshakeMonitor');

const wss = new WebSocket.Server({ port: 3001 });
let sockets = [];

wss.on('connection', (socket) => {
  sockets.push(socket);
  socket.on('close', () => {
    sockets = sockets.filter(s => s !== socket);
  });
});

monitorarAssociation(sockets);
monitorarAuthentication(sockets);
monitorarHandshake(sockets);
