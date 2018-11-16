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
const util = require('util');

// Only see detailed logs if index.js is started with NODE_DEBUG=server
const debug = util.debuglog('server');

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
      let chosenHandler =
        trimmedPath in server.router
          ? server.router[trimmedPath]
          : handlers.notFound;

      // Use public handler if the request is within the public dir
      chosenHandler = trimmedPath.includes('public/')
        ? handlers.public
        : chosenHandler;

      // Construct data obj to send to handler
      const data = {
        trimmedPath,
        queryStringObj,
        method,
        headers,
        payload: helpers.parseJson(buffer),
      };

      // Route request to handler specified in router
      chosenHandler(data, function(statusCode, payload, contentType) {
        // All previously created api handlers use json content type
        // Will default to json and only assign incoming if it exists
        contentType = typeof contentType === 'string' ? contentType : 'json';

        // Use status code called back by handler or default to 200
        statusCode = typeof statusCode === 'number' ? statusCode : 200;

        // * Return parts of response that are content-specific
        // Default payloadString to empty string
        let payloadString = '';

        if (contentType === 'json') {
          res.setHeader('Content-Type', 'application/json');

          // Use payload called back by handler or default to empty obj
          payload = typeof payload === 'object' ? payload : {};

          // Convert payload to json string and overwrite empty string
          payloadString = JSON.stringify(payload);
        }

        if (contentType === 'html') {
          res.setHeader('Content-Type', 'text/html');

          // Use string payload called back by handler or keep empty str
          payloadString = typeof payload === 'string' ? payload : '';
        }

        if (contentType === 'favicon') {
          res.setHeader('Content-Type', 'image/x-icon');
          payloadString = typeof payload !== 'undefined' ? payload : '';
        }

        if (contentType === 'css') {
          res.setHeader('Content-Type', 'text/css');
          payloadString = typeof payload !== 'undefined' ? payload : '';
        }

        if (contentType === 'png') {
          res.setHeader('Content-Type', 'image/png');
          payloadString = typeof payload !== 'undefined' ? payload : '';
        }

        if (contentType === 'jpg') {
          res.setHeader('Content-Type', 'image/jpeg');
          payloadString = typeof payload !== 'undefined' ? payload : '';
        }

        if (contentType === 'plain') {
          res.setHeader('Content-Type', 'text/plain');
          payloadString = typeof payload !== 'undefined' ? payload : '';
        }

        // * Return parts of response that are common to all content types
        res.writeHead(statusCode);
        res.end(payloadString);

        // Print green if response is 200, red otherwise
        if (statusCode === 200) {
          debug(
            '\x1b[32m%s\x1b[0m',
            `${method.toUpperCase()} /${trimmedPath} ${statusCode}`
          );
        } else {
          debug(
            '\x1b[31m%s\x1b[0m',
            `${method.toUpperCase()} /${trimmedPath} ${statusCode}`
          );
        }
      });
    });
  },

  // Define request router
  router: {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/verify': handlers.accountVerify,
    'account/edit': handlers.accountEdit,
    'account/deleted': handlers.accountDeleted,
    'session/create': handlers.sessionCreate,
    'session/deleted': handlers.sessionDeleted,
    'checks/all': handlers.checksList,
    'checks/create': handlers.checksCreate,
    'checks/edit': handlers.checksEdit,
    ping: handlers.ping,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks,
    'favicon.ico': handlers.favicon,
    public: handlers.public,
  },

  init() {
    // Start HTTP server, listen on env port
    server.httpServer.listen(config.httpPort, () => {
      console.log(
        '\x1b[1m%s\x1b[0m',
        `HTTP server listening on port ${config.httpPort}`
      );
    });
    // Start HTTPS server
    server.httpsServer.listen(config.httpsPort, () => {
      console.log(
        '\x1b[1m%s\x1b[0m',
        `HTTPS server listening on port ${config.httpsPort}`
      );
    });
  },
};

// Start the server, listen on env port

// Start HTTPS server

// Export module
module.exports = server;
