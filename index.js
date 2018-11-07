/**
 * -- Primary File for the API --
 *
 * Restful api for uptime monitoring app
 * 1. Listen for POST, GET, PUT, DELETE, HEAD
 * 2. Allow client to connect, create/edit/delete user
 * 3. Allow signin which provides token for subsequent authenticated requests
 * 4. Allow signout which invalidates token
 * 5. Signed in user can use their token to create a new "check"
 * 6. User can define check url and params
 * 7. Signed in user can edit/delete their checks, limit checks
 * 8. Periodically perform checks in the background, alert users on change
 */

// Dependencies
const http = require('http');
const url = require('url');

// Server should respond to all requests with a string
const server = http.createServer((req, res) => {
  // Get URL and parse it - 2nd bool param to call querystring module
  const parsedUrl = url.parse(req.url, true);

  // Get path
  const path = parsedUrl.pathname;

  // Trim any unnecessary slashes user may have sent
  // localhost:3000/foo/bar == localhost/foo/bar/
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get query string as object
  const queryStringObj = parsedUrl.query;

  // Get headers as object
  const headers = req.headers;

  // Get http method
  const method = req.method.toLowerCase();

  // Send response
  res.end('Hello World\n');

  // Log request path
  console.log(
    `Request received. Path: ${trimmedPath} | Method: ${method} | Query string params: `,
    queryStringObj
  );
  console.log('Headers: ', headers);
});

// Start the server, have it listen on port 3000
server.listen(3000, () => console.log('Server listening on port 3000'));
