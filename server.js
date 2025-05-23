const express = require('express');
const cors = require('cors');

const WebSocket = require('ws');
const bodyParser = require('express').json;

const monitorarAssociation = require('./monitor/associationMonitor');
const monitorarAuthentication = require('./monitor/authenticationMonitor');
const monitorarHandshake = require('./monitor/handshakeMonitor');

const handshakeRoutes = require('./routes/handshakeRoutes');

// ====== Servidor HTTP Express na porta 3000 ======
const app = express();
app.use(cors());
app.use(bodyParser());
app.use('/handshake', handshakeRoutes);

const httpServer = app.listen(3000);

// ====== WebSocket Server separado na porta 3001 ======
const wss = new WebSocket.Server({ port: 3001 });
let sockets = [];

wss.on('connection', (socket) => {
  sockets.push(socket);
  socket.on('close', () => {
    sockets = sockets.filter(s => s !== socket);
  });
});

const getSockets = () => sockets;

// ====== Monitores que usam os sockets ======
monitorarAssociation(getSockets);
monitorarAuthentication(getSockets);
monitorarHandshake(getSockets);
