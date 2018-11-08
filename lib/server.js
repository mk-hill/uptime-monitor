/**
 * Server-related tasks
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');

// Instantiate server module object
const server = {
  // Instantiate HTTP server
  httpServer: http.createServer((req, res) => {
    server.unifiedServer(req, res);
  }),

  httpsServerOptions: {
    key: fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '/../https/cert.pem')),
  },

  // Instantiate HTTPS server
  httpsServer: https.createServer(this.httpsServerOptions, (req, res) => {
    server.unifiedServer(req, res);
  }),

  // All server logic for both http and https server
  unifiedServer(req, res) {
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
        trimmedPath in server.router
          ? server.router[trimmedPath]
          : handlers.notFound;

      // Construct data obj to send to handler
      const data = {
        trimmedPath,
        queryStringObj,
        method,
        headers,
        payload: helpers.parseJson(buffer),
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
  },

  // Define request router
  router: {
    ping: handlers.ping,
    users: handlers.users,
    tokens: handlers.tokens,
    checks: handlers.checks,
  },

  init() {
    // Start HTTP server, listen on env port
    server.httpServer.listen(config.httpPort, () =>
      console.log(`HTTP server listening on port ${config.httpPort}`)
    );
    // Start HTTPS server
    server.httpsServer.listen(config.httpsPort, () =>
      console.log(`HTTPS server listening on port ${config.httpsPort}`)
    );
  },
};

// Start the server, listen on env port

// Start HTTPS server

// Export module
module.exports = server;
