'use strict';

import * as _ from 'lodash';
import * as fs from 'fs';
import * as net from 'net';
import { response } from './responses';

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
  const [ method, path ] = messageHeader.split(' ');
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
function getContentType(fileType: string | undefined): string {
  // TODO (nw): move this to a definitions folder
  const contentTypesByfileType = { 
    html: 'text/html'
  };
  const contentType: string = contentTypesByfileType.html;
  return contentType;
}

/*
 * Response body looks like:
    const response: string = `HTTP/1.1 200 OK
      Content-type: text/html

      <H1>Success!</H1>`;
*/
function createResponse(contentType: string, fileContents: string): string {
  const response: string = `HTTP/1.1 200 OK
    Content-type: ${contentType}

    ${fileContents}`;

  return response;
}

net.createServer(socket => {
  socket.on('data', async (data: Buffer) => {
    const { method, path } = parseRequest(data.toString());
    const fileContents: string = await readFile(path);

    const fileType: string | undefined = _.last(path.split('.'));

    if (_.isUndefined(fileType)) {
      // have a well defined 404 response here and send it
      return;
    }

    const contentType: string = getContentType(fileType);
    const response: string = createResponse(contentType, fileContents);
    socket.write(Buffer.from(response), (err: string, res: boolean) => {
      if (err) {
        console.log(`error writing tcp response ${err}`);
        process.exit(1);
      }
      socket.destroy();
    });
  });

  // possibly cleanup stuff here? 
  socket.on('close', data => {
  });
}).listen(PORT, HOST);
