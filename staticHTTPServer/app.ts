'use strict';

import * as assert from 'assert';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as net from 'net';
import * as responses from './responses';

const HOST = '127.0.0.1';
const PORT = 8080;

console.log(`Starting static HTTP server on port ${PORT}`);

// What's necessary for this server? It should:
// 1) accept a file path to read (e.g. index.html)
// 2) look in /static for the file
// 3) Determine the content-type (based on the filetype?)
// 4) Create and send a response

function parseRequest(req: string) {
  const [messageHeader] = req.split('\n');
  const [ method, rawPath ] = messageHeader.split(' ');
  const path = rawPath === '/' ? '/index.html' : rawPath;
  return { method, path };
}

// Get file metadata or actual file contents? Can we stream contents to client instead of buffering?
// For now go ez mode and get actual file
async function readFile(path: string) {
  // TODO (nw): factor out new promise resolve/reject pattern into typed promisify
  // slash grab one from npm
  const fileContents = await new Promise((resolve, reject) => {
    // TODO (nw): determination of path of file should be made more robust
    fs.readFile(`./static/${path}`, 'utf8', (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
  return fileContents.toString();
}

// TODO (nw): figure out method of telling typescript comp yes this actually cant be undefd
function getContentType(fileType: string): string {
  // TODO (nw): move this to a definitions folder
  const contentTypesByfileType: { [key: string]: string; } = { 
    html: 'text/html',
    css: 'text/css',
    js: 'text/javascript',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
  };
  const contentType: string = contentTypesByfileType[fileType];
  return contentType;
}

// TODO (nw): figure out correct type for socket. More importantly: how do you generally determine?
async function sendResponse(socket: any, response: string) {
  socket.write(Buffer.from(response), (err: string, res: boolean) => {
    if (err) {
      // TODO (nw): dont break process on socket error?
      console.log(`error writing tcp response ${err}`);
      process.exit(1);
    }
    socket.destroy();
  });
}

net.createServer(socket => {
  socket.on('data', async (data: Buffer) => {
    const { method, path } = parseRequest(data.toString());
    try {
      const fileType = _.last(path.split('.')) as string;
      const fileContents: string = await readFile(path);
      const contentType: string = getContentType(fileType);
      const response: string = responses.createOK(contentType, fileContents);
      sendResponse(socket, response);
    } catch (e) {
      console.log(`Error handling request ${e}`);
      // This is not secure :P
      if (_.includes(e, 'Error handling request Error: ENOENT: no such file or directory')) {
        return sendResponse(socket, responses.createFileNotFound());
      }

      sendResponse(socket, responses.createServerError());
    }
  });

  // possibly cleanup stuff here? 
  socket.on('close', data => {
  });
}).listen(PORT, HOST);
