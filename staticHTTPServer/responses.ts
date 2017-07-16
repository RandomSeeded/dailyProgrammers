export function createOK(contentType: string, fileContents: string): string {
  const response: string = `HTTP/1.1 200 OK
    Content-type: ${contentType}

    ${fileContents}`;

  return response;
}

export function createFileNotFound(): string {
  const response: string = `HTTP/1.1 404
    Content-type: text/html

    <h1>File Not Found</h1>`;
  return response;
}

export function createServerError(): string {
  const response: string = `HTTP/1.1 500
    Content-type: text/html

    <h1>Internal Server Error</h1>`;
  return response;
}
