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
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const cluster = require('cluster');
const os = require('os');

// Declare app
const app = {
  // Initialize app - Added callback for api testing
  init(callback) {
    // Start workers and cli on master thread
    if (cluster.isMaster) {
      // Master thread lands here
      // Start workers
      workers.init();

      // Start CLI prompt last
      setTimeout(() => {
        cli.init();
        if (callback) {
          callback();
        }
      }, 50);

      // Fork the process - all other threads will run server instead of workers and cli
      for (let i = 0; i < os.cpus().length; i++) {
        cluster.fork();
      }
    } else {
      // Forks land here
      // If we're not on the master thread, start server instead
      // Each thread is listening on the same port, node shares requests as they come in
      server.init();
    }
  },
};

// Execute init only if file is invoked directly to enable test runner
if (require.main === module) {
  app.init();
}

// Export app
module.exports = app;
