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
        'quit',
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

  // Create vertical space
  verticalSpace(lines) {
    // Default to one line
    lines = typeof lines === 'number' && lines > 0 ? lines : 1;
    for (let i = 0; i < lines; i++) {
      console.log('');
    }
  },

  // Create horizontal line across viewport
  horizontalLine() {
    // Get available width
    const width = process.stdout.columns;

    let line = '';
    for (let i = 0; i < width; i++) {
      line += '-';
    }
    console.log(line);
  },

  // Center given text on screen
  centered(str) {
    str = typeof str === 'string' && str.trim().length > 0 ? str.trim() : '';

    // Get available width
    const width = process.stdout.columns;
    let line = '';

    // Calculate left padding and add it to line
    const leftPadding = Math.floor((width - str.length) / 2);
    for (let i = 0; i < leftPadding; i++) {
      line += ' ';
    }

    // Add centered string to line and print out
    line += str;
    console.log(line);
  },

  // Responders
  responders: {
    // Help/man
    help() {
      const commands = {
        exit: 'Terminate CLI (and the rest of the application)',
        quit: 'Alias for the "exit" command',
        help: 'Display this help page',
        man: 'Alias for the "help" command',
        stats:
          'Get statistics on the underlying system and resource utilization',
        'list users': 'Display a list of all the current users',
        'more user info --{userId}': 'Show details of specified user',
        'list checks --up --down':
          'Display a list of all active checks, including their state. "--up" and "--down" flags are optional',
        'more check info --{checkId}': 'Show details of specified check',
        'list logs':
          'Display a list of all the log files available (compressed and uncompressed)',
        'more log info --{fileName}': 'Show details of specified log file',
      };

      // Show a header for the help page that is as wide as the viewport
      cli.horizontalLine();
      cli.centered('CLI MANUAL');
      cli.horizontalLine();
      cli.verticalSpace(2);

      // Display each command followed by its explanation, in white and yellow respectively
      for (let key in commands) {
        if (commands.hasOwnProperty(key)) {
          const value = commands[key];
          let line = `\x1b[33m${key}\x1b[0m`;
          const padding = 60 - line.length;
          for (let i = 0; i < padding; i++) {
            // Add correct number of spaces to keep pairs aligned
            line += ' ';
          }
          line += value;
          console.log(line);
          cli.verticalSpace();
        }
      }

      cli.verticalSpace();

      // End with another horizontal line
      cli.horizontalLine();
    },

    // Exit/quit
    exit() {
      console.log('Terminating session');
      process.exit(0);
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

e.on('quit', str => {
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
