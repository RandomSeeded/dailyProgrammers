'use strict';

// import * as async from 'async';
import * as net from 'net';
import { response } from './responses';

const HOST = '127.0.0.1';
const PORT = 8080;

console.log('starting socket listener');

net.createServer(socket => {
  socket.on('data', (data: Buffer) => {
    socket.write(Buffer.from(response), (err: string, res: boolean) => {
      if (err) {
        console.log(`error writing tcp response ${err}`);
        process.exit(1);
      }
      socket.destroy();
    });
  });

  socket.on('close', data => {
    console.log('close data', data);
  });
}).listen(PORT, HOST);



