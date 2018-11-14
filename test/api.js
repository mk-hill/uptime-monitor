/**
 * API tests
 */
// Dependencies
const app = require('../index');
const config = require('../lib/config');
const assert = require('assert');
const http = require('http');

// Container for tests
const api = {
  'app.init() function should be able to run without throwing'(done) {
    assert.doesNotThrow(() => {
      app.init(err => {
        done();
      });
    }, TypeError);
  },

  '/ping should respond to GET with 200'(done) {
    helpers.makeGetRequest('/ping', res => {
      assert.equal(res.statusCode, 200);
      done();
    });
  },

  '/api/users should respond to GET with 400'(done) {
    helpers.makeGetRequest('/api/users', res => {
      assert.equal(res.statusCode, 400);
      done();
    });
  },

  'Random path should respond to GET with 404'(done) {
    helpers.makeGetRequest('/this/path/doesnt/exist', res => {
      assert.equal(res.statusCode, 404);
      done();
    });
  },
};

// Helpers
const helpers = {
  makeGetRequest(path, callback) {
    // Configure request details
    const requestDetails = {
      protocol: 'http:',
      hostname: 'localhost',
      port: config.httpPort,
      method: 'GET',
      path,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Send request
    const req = http.request(requestDetails, res => {
      callback(res);
    });

    req.end();
  },
};

// app.init() function should be able to run without throwing

// Export module to test runner
module.exports = api;
