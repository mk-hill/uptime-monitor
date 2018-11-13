/**
 * CLI related tasks
 */

// Dependencies
const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const events = require('events');
class _events extends events {}
const e = new _events();

// Instantiate CLI module object
const cli = {
  // Initialize cli
  init() {
    // Send start message to the console in yellow
    console.log('\x1b[33m%s\x1b[0m', 'CLI is running');

    // Start the interface
    const _interface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> ',
    });

    // Create initial prompt
    _interface.prompt();

    // Handle each input line separately
    _interface.on('line', str => {
      // Send to the input processor
      this.processInput(str);

      // Reinitialize the prompt
      _interface.prompt();

      // End associated process when user stops CLI
      _interface.on('close', () => {
        process.exit(0);
      });
    });
  },

  // Input processor
  processInput(str) {
    str = typeof str === 'string' && str.trim().length > 0 ? str.trim() : false;

    // Only continue if there is an input, ignore otherwise
    if (str) {
      // Codify the unique strings that identify user commands
      const commands = [
        'man',
        'help',
        'exit',
        'stats',
        'list users',
        'more user info',
        'list checks',
        'more check info',
        'list logs',
        'more log info',
      ];

      // Check input against options, emit event when match is found
      let matchFound = false;
      const counter = 0;
      commands.some(command => {
        if (str.toLowerCase().includes(command)) {
          matchFound = true;
          // Emit event matching unique input and include full string provided by user
          e.emit(command, str);
          // Break out of loop
          return true;
        }
      });

      // Alert user if no match is found
      if (!matchFound) {
        console.log(`Command '${str}' not found, please try again.`);
      }
    }
  },

  // Responders
  responders: {
    // Help/man
    help() {
      console.log('help responder');
    },

    exit() {
      console.log('exit responder');
    },

    stats() {
      console.log('stats responder');
    },

    listUsers() {
      console.log('listUsers responder');
    },

    moreUserInfo(str) {
      console.log('moreUserInfo responder', str);
    },

    listChecks(str) {
      console.log('listChecks responder', str);
    },

    moreCheckInfo(str) {
      console.log('moreCheckInfo responder', str);
    },

    listLogs() {
      console.log('listLogs responder');
    },

    moreLogInfo(str) {
      console.log('moreLogInfo responder', str);
    },
  },
};

// Input handlers
e.on('man', str => {
  cli.responders.help();
});

e.on('help', str => {
  cli.responders.help();
});

e.on('exit', str => {
  cli.responders.exit();
});

e.on('stats', str => {
  cli.responders.stats();
});

e.on('list users', str => {
  cli.responders.listUsers();
});

e.on('more user info', str => {
  // Pass in user
  cli.responders.moreUserInfo(str);
});

e.on('list checks', str => {
  // Pass in up/down state
  cli.responders.listChecks(str);
});

e.on('more check info', str => {
  // Pass in check id
  cli.responders.moreCheckInfo(str);
});

e.on('list logs', str => {
  cli.responders.listLogs();
});

e.on('more log info', str => {
  // Pass in log
  cli.responders.moreLogInfo(str);
});

// Export module
module.exports = cli;
