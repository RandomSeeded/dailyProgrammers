'use strict';

import * as net from 'net';

const HOST = '127.0.0.1';
const PORT = 8080;

console.log('starting socket listener');
net.createServer(socket => {
  console.log('socket.remoteAddress', socket.remoteAddress);
  console.log('socket.remotePort', socket.remotePort);
}).listen(PORT, HOST);



