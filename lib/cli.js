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
const os = require('os');
const v8 = require('v8');
const dataLib = require('./data');
const logsLib = require('./logs');
const helpers = require('./helpers');
// const childProcess = require('child_process');

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
        console.log(
          `Command '${str}' not found, enter 'help' for list of commands.`
        );
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
          'Get statistics on the underlying operating system and resource utilization',
        'list users': 'Display a list of all the current users',
        'more user info --{userId}': 'Show details of specified user',
        'list checks --up --down':
          'Display all active checks, optionally filter using "--up" or "--down" flag',
        'more check info --{checkId}': 'Show details of specified check',
        'list logs': 'Display a list of compressed log files',
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
      console.log('Terminating application.');
      process.exit(0);
    },

    stats() {
      // Compile stats object
      const stats = {
        'Load Average': os.loadavg().join(' '),
        'Logical Core Count': os.cpus().length,
        'Free Memory': `${Math.floor(os.freemem() / 1024 / 1024)} MB`,
        'Current Malloced Memory': v8.getHeapStatistics().malloced_memory,
        'Peak Malloced Memory': v8.getHeapStatistics().peak_malloced_memory,
        'Allocated Heap Used (%)': Math.round(
          (v8.getHeapStatistics().used_heap_size /
            v8.getHeapStatistics().total_heap_size) *
            100
        ),
        'Available Heap Allocated (%)': Math.round(
          (v8.getHeapStatistics().total_heap_size /
            v8.getHeapStatistics().heap_size_limit) *
            100
        ),
        Uptime: `${os.uptime()} seconds`,
      };

      // Show a header for the stats
      cli.horizontalLine();
      cli.centered('SYSTEM STATISTICS');
      cli.horizontalLine();
      cli.verticalSpace(2);

      // Display each stat followed by its explanation, in white and yellow respectively
      for (let key in stats) {
        if (stats.hasOwnProperty(key)) {
          const value = stats[key];
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

    listUsers() {
      dataLib.list('users', (err, userIds) => {
        cli.verticalSpace();
        // Continue if users exist
        if (!err && userIds && userIds.length > 0) {
          userIds.forEach(userId => {
            dataLib.read('users', userId, (err, userData) => {
              if (!err && userData) {
                const { firstName, lastName, phone, checks } = userData;
                const numberOfChecks =
                  typeof checks === 'object' &&
                  checks instanceof Array &&
                  checks.length > 0
                    ? checks.length
                    : 0;
                const line = `Name: \x1b[33m${firstName} ${lastName}\x1b[0m Phone: \x1b[33m${phone}\x1b[0m Checks: \x1b[33m${numberOfChecks}\x1b[0m`;
                console.log(line);
                cli.verticalSpace();
              }
            });
          });
        } else {
          console.log('Error listing users, there may not be any');
        }
      });
    },

    moreUserInfo(str) {
      // Get user ID from input string
      const arr = str.split('--');
      const userId =
        typeof arr[1] === 'string' && arr[1].trim().length > 0
          ? arr[1].trim()
          : false;

      // Only continue if truthy id
      if (userId) {
        // Lookup user
        dataLib.read('users', userId, (err, userData) => {
          if (!err && userData) {
            // Removed hashed password from object
            delete userData.hashedPassword;

            // Print JSON with text highlighting
            cli.verticalSpace();
            console.dir(userData, { colors: true });
            cli.verticalSpace();
          }
        });
      }
    },

    listChecks(str) {
      // Get flag if one exists
      const arr = str.split('--');
      const flag =
        typeof arr[1] === 'string' &&
        ['up', 'down'].includes(arr[1].trim().toLowerCase())
          ? arr[1].trim().toLowerCase()
          : false;

      // Get checks
      dataLib.list('checks', (err, checkIds) => {
        cli.verticalSpace();
        if (!err && checkIds && checkIds.length > 0) {
          checkIds.forEach(checkId => {
            dataLib.read('checks', checkId, (err, checkData) => {
              // Get check state, default to down
              const validatedState =
                typeof checkData.state === 'string' ? checkData.state : 'down';
              if (
                !flag ||
                flag === validatedState ||
                (flag === 'down' && checkData.state === 'unkown')
              ) {
                const { id, method, protocol, url, state } = checkData;
                let line = `ID: ${id} ${method.toUpperCase()} \x1b[33m${protocol}://${url}\x1b[0m State: \x1b[33m${state}\x1b[0m`;
                console.log(line);
                cli.verticalSpace();
              }
            });
          });
        } else {
          console.log('Error listing checks, there may not be any');
        }
      });
    },

    moreCheckInfo(str) {
      // Get check ID from input string
      const arr = str.split('--');
      const checkId =
        typeof arr[1] === 'string' && arr[1].trim().length > 0
          ? arr[1].trim()
          : false;

      // Only continue if truthy id
      if (checkId) {
        // Lookup check
        dataLib.read('checks', checkId, (err, checkData) => {
          if (!err && checkData) {
            // Print JSON with text highlighting
            cli.verticalSpace();
            console.dir(checkData, { colors: true });
            cli.verticalSpace();
          }
        });
      }
    },

    listLogs() {
      // Get all log file names
      logsLib.list(true, (err, logFileNames) => {
        cli.verticalSpace();
        if (!err && logFileNames && logFileNames.length > 0) {
          logFileNames.forEach(logFileName => {
            // Compressed file names have timestamp and dash, using dash to filter
            if (logFileName.includes('-')) {
              console.log(logFileName);
              cli.verticalSpace();
            }
          });
        } else {
          console.log('Error listing log files, there may not be any');
        }
      });
    },

    // Alternative using child process ls
    // listLogs() {
    //   // Call ls on ./logs/ dir
    //   const ls = childProcess.spawn('ls', ['./.logs/']);

    //   // Every time ls pipes out data to stdout, bind to func
    //   ls.stdout.on('data', dataObj => {
    //     // Explode into separate lines
    //     const dataStr = dataObj.toString();
    //     const logFileNames = dataStr.split('\n');
    //     cli.verticalSpace();

    //     logFileNames.forEach(logFileName => {
    //       // Compressed file names have timestamp and dash, using dash to filter
    //       // Check for length and type to help avoid any system files
    //       if (
    //         typeof logFileName === 'string' &&
    //         logFileName.length > 0 &&
    //         logFileName.includes('-')
    //       ) {
    //         console.log(logFileName.trim().split('.')[0]);
    //         cli.verticalSpace();
    //       }
    //     });
    //   });
    // },

    moreLogInfo(str) {
      // Get log file name from input string
      const arr = str.split('--');
      const logFileName =
        typeof arr[1] === 'string' && arr[1].trim().length > 0
          ? arr[1].trim()
          : false;

      // Only continue log file name is valid string
      if (logFileName) {
        cli.verticalSpace();
        // Decompress the log file
        logsLib.decompress(logFileName, (err, strData) => {
          if (!err && strData) {
            // Log file contains JSON strings with new line in between
            // Split into separate lines
            const stringsArr = strData.split('\n');
            stringsArr.forEach(jsonString => {
              const logObject = helpers.parseJson(jsonString);
              if (logObject && JSON.stringify(logObject) !== '{}') {
                console.dir(logObject, { colors: true });
                cli.verticalSpace();
              }
            });
          } else {
            console.log(
              'Error accessing log file, provided file name may be incorrect'
            );
          }
        });
      }
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
