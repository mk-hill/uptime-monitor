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
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');

// Instantiate HTTP server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

// Start the server, listen on env port
httpServer.listen(config.httpPort, () =>
  console.log(`HTTP server listening on port ${config.httpPort}`)
);

// Instantiate HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem'),
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});

// Start HTTPS server
httpsServer.listen(config.httpsPort, () =>
  console.log(`HTTPS server listening on port ${config.httpsPort}`)
);

// All server logic for both http and https server
const unifiedServer = (req, res) => {
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

  // Get payload, if any
  const decoder = new StringDecoder('utf-8');

  // "buffer" will be appended to as payload streams in
  let buffer = '';

  // As data streams in, req emits data event, sending it to decoder
  req.on('data', data => {
    buffer += decoder.write(data);
  });

  // Upon completion, req obj emits end
  // * end event will get called even regardless of payload existence
  // Moving response, logging here into end event handler
  req.on('end', () => {
    buffer += decoder.end();

    // Choose handler this request will go to
    // Use notFound handler if one is not found
    const chosenHandler =
      trimmedPath in router ? router[trimmedPath] : handlers.notFound;

    // Construct data obj to send to handler
    const data = {
      trimmedPath,
      queryStringObj,
      method,
      headers,
      payload: buffer,
    };

    // Route request to handler specified in router
    chosenHandler(data, function(statusCode, payload) {
      // Use status code called back by handler or default to 200
      statusCode = typeof statusCode === 'number' ? statusCode : 200;

      // Use payload called back by handler or default to empty obj
      payload = typeof payload === 'object' ? payload : {};

      // Convert payload to json string
      const payloadString = JSON.stringify(payload);

      // Return response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      // Log response
      console.log('Returning response: ', statusCode, payloadString);
    });
  });
};

// Define handlers
const handlers = {
  // // data will receive all parsed info from server above
  // sample: function(data, callback) {
  //   // Callback an http status code and a payload obj
  //   callback(406, { name: 'sample handler' });
  // },

  // Just respond with 200
  ping: function(data, callback) {
    callback(200);
  },

  notFound: function(data, callback) {
    callback(404);
  },
};

// Define request router
const router = {
  ping: handlers.ping,
};
