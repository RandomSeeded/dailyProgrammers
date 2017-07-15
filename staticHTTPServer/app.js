'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
var HOST = '127.0.0.1';
var PORT = 8080;
console.log('starting socket listener');
net.createServer(function (socket) {
    console.log('socket.remoteAddress', socket.remoteAddress);
    console.log('socket.remotePort', socket.remotePort);
}).listen(PORT, HOST);
