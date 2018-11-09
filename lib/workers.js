/**
 * Worker-related tasks
 */

// Dependencies
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const url = require('url');
const dataLib = require('./data');
const helpers = require('./helpers');
const logsLib = require('./logs');

// Instantiate worker object
const workers = {
  // Init script
  init() {
    // Execute all the checks immediately
    this.gatherAllChecks();

    // Call a loop to have checks continue executing on their own
    this.loop();

    // Compress all the logs immediately
    this.rotateLogs();

    // Call compression loop so logs continue to get compressed periodically
    this.logRotationLoop();
  },

  // Timer to execute checks once per minute
  loop() {
    setInterval(() => {
      this.gatherAllChecks();
    }, 1000 * 60);
  },

  // Timer to execute log rotation process once per day
  logRotationLoop() {
    setInterval(() => {
      this.rotateLogs();
    }, 1000 * 60 * 60 * 24);
  },

  // Rotate (compress) log files
  rotateLogs() {
    // List all the uncompressed log files
    logsLib.list(false, (err, logs) => {
      if (!err && logs && logs.length > 0) {
        logs.forEach(logFileName => {
          // Compress the data to a different file
          const logId = logFileName.replace('.log', '');
          const newFileId = `${logId}-${Date.now()}`;
          logsLib.compress(logId, newFileId, err => {
            if (!err) {
              // Truncate the log
              logsLib.truncate(logId, err => {
                if (!err) {
                  console.log('Success truncating logFile');
                } else {
                  console.log('Error truncating logFile');
                }
              });
            } else {
              console.log('Error compressing a log file', err);
            }
          });
        });
      } else {
        console.log('Error: could not find any logs to rotate');
      }
    });
  },

  // Log check
  log(originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck) {
    // Form the log data
    const logData = {
      check: originalCheckData,
      outcome: checkOutcome,
      state,
      alert: alertWarranted,
      time: timeOfCheck,
    };

    // Convert to a string
    const logString = JSON.stringify(logData);

    // Determine the name of the log file
    const logFileName = originalCheckData.id;

    // Append the log string to the file
    logsLib.append(logFileName, logString, err => {
      if (!err) {
        console.log('Logging to file succeeded');
      } else {
        console.log('Logging to file failed');
      }
    });
  },

  // Process internal, no requester, no need to callback errors
  // Lookup all checks, get their data, send to a validator
  gatherAllChecks() {
    // Get all the checks that exist
    dataLib.list('checks', (err, checks) => {
      if (!err && checks && checks.length > 0) {
        checks.forEach(check => {
          // Read check data
          dataLib.read('checks', check, (err, originalCheckData) => {
            if (!err && originalCheckData) {
              // Pass data to check validator, let that func continue or log errors as needed
              this.validateCheckData(originalCheckData);
            } else {
              console.log('Error reading a check\'s data');
            }
          });
        });
      } else {
        console.log('Error: Could not find any checks to process');
      }
    });
  },

  // Ensure check-data has required data
  validateCheckData(originalCheckData) {
    originalCheckData =
      typeof originalCheckData === 'object' && originalCheckData !== null
        ? originalCheckData
        : {};
    originalCheckData.id =
      typeof originalCheckData.id === 'string' &&
      originalCheckData.id.trim().length === 20
        ? originalCheckData.id.trim()
        : false;
    originalCheckData.userPhone =
      typeof originalCheckData.userPhone === 'string' &&
      originalCheckData.userPhone.trim().length === 10
        ? originalCheckData.userPhone.trim()
        : false;
    originalCheckData.protocol =
      typeof originalCheckData.protocol === 'string' &&
      ['http', 'https'].includes(originalCheckData.protocol)
        ? originalCheckData.protocol
        : false;
    originalCheckData.url =
      typeof originalCheckData.url === 'string' &&
      originalCheckData.url.trim().length > 0
        ? originalCheckData.url.trim()
        : false;
    originalCheckData.method =
      typeof originalCheckData.method === 'string' &&
      ['post', 'get', 'put', 'delete'].includes(originalCheckData.method)
        ? originalCheckData.method
        : false;
    originalCheckData.successCodes =
      typeof originalCheckData.successCodes === 'object' &&
      originalCheckData.successCodes instanceof Array &&
      originalCheckData.successCodes.length > 0
        ? originalCheckData.successCodes
        : false;
    originalCheckData.timeoutSeconds =
      typeof originalCheckData.timeoutSeconds === 'number' &&
      originalCheckData.timeoutSeconds % 1 === 0 &&
      originalCheckData.timeoutSeconds >= 1 &&
      originalCheckData.timeoutSeconds <= 5
        ? originalCheckData.timeoutSeconds
        : false;

    // * Check for keys added by workers, add them if workers haven't seen this check before

    // Defaulting to down for state, first check will determine if up
    originalCheckData.state =
      typeof originalCheckData.state === 'string' &&
      ['up', 'down'].includes(originalCheckData.state)
        ? originalCheckData.state
        : 'down';

    // Defaulting to false, so down state cause can be determined
    // Down because it hasn't been checked or down when lastChecked
    originalCheckData.lastChecked =
      typeof originalCheckData.lastChecked === 'number' &&
      originalCheckData.lastChecked > 0
        ? originalCheckData.lastChecked
        : false;

    // If all checks pass, pass the data along to the next step
    if (
      originalCheckData.id &&
      originalCheckData.userPhone &&
      originalCheckData.protocol &&
      originalCheckData.url &&
      originalCheckData.method &&
      originalCheckData.successCodes &&
      originalCheckData.timeoutSeconds
    ) {
      workers.performCheck(originalCheckData);
    } else {
      if (originalCheckData.id) {
        console.log(
          `Error: Check ${
            originalCheckData.id
          } is not properly formatted. Skipping it.`
        );
      } else {
        console.log(
          'Error: One of the checks is not properly formatted. Skipping it.'
        );
      }
    }
  },

  // Perform check, send originalCheckData and outcome of check to next step
  performCheck(originalCheckData) {
    // Prepare initial check outcome
    const checkOutcome = {
      error: false,
      responseCode: false,
    };

    // Mark that the outcome has not been sent yet
    let outcomeSent = false;

    // Parse host name and path from originalCheckData
    const parsedUrl = url.parse(
      `${originalCheckData.protocol}://${originalCheckData.url}`,
      true
    );

    const hostName = parsedUrl.hostName;

    // Using path as opposed to pathname to get full query string
    const path = parsedUrl.path;

    // Construct request
    const requestDetails = {
      protocol: `${originalCheckData.protocol}:`,
      hostname: hostName,
      method: originalCheckData.method.toUpperCase(),
      path,
      timeout: originalCheckData.timeoutSeconds * 1000,
    };

    // Instantiate request object using either either http or https module
    const moduleToUse = originalCheckData.protocol === 'http' ? http : https;

    // todo Look into node docs further, first url arg below should not be necessary
    const req = moduleToUse.request(parsedUrl.href, requestDetails, res => {
      // Grab status of sent request
      const status = res.statusCode;

      // Update checkOutcome and pass the data along
      checkOutcome.responseCode = status;
      if (!outcomeSent) {
        workers.processCheckOutcome(originalCheckData, checkOutcome);
        outcomeSent = true;
      }
    });

    // Bind to error event so it doesn't get thrown
    req.on('error', e => {
      // Update checkOutcome and pass the data along
      checkOutcome.error = {
        error: true,
        value: e,
      };
      if (!outcomeSent) {
        workers.processCheckOutcome(originalCheckData, checkOutcome);
        outcomeSent = true;
      }
    });

    // Bind to timeout event
    req.on('timeout', e => {
      // Update checkOutcome and pass the data along
      checkOutcome.error = {
        error: true,
        value: 'timeout',
      };
      if (!outcomeSent) {
        workers.processCheckOutcome(originalCheckData, checkOutcome);
        outcomeSent = true;
      }
    });

    // End the request
    req.end();
  },

  // Process check outcome, update check data as needed, trigger alert to user if needed
  // Special logic for a check that hasn't been tested yet, no user alert in that case
  processCheckOutcome(originalCheckData, checkOutcome) {
    // Decide if state is up or down
    // Up if no error, got response code, response code is considered success by user's check params
    const state =
      !checkOutcome.error &&
      checkOutcome.responseCode &&
      originalCheckData.successCodes.includes(checkOutcome.responseCode)
        ? 'up'
        : 'down';

    // Decide if alert is warranted
    // lastChecked false by default, only contains time if there was a prior check
    // Alert warranted if state changed from prior check
    const alertWarranted =
      originalCheckData.lastChecked && originalCheckData.state !== state
        ? true
        : false;

    const timeOfCheck = Date.now();

    // Log the outcome
    workers.log(
      originalCheckData,
      checkOutcome,
      state,
      alertWarranted,
      timeOfCheck
    );

    // Update check data
    const newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = timeOfCheck;

    // Save updated check
    dataLib.update('checks', newCheckData.id, newCheckData, err => {
      if (!err) {
        // Send newCheckData to next phase if needed
        if (alertWarranted) {
          workers.alertUserToStatusChange(newCheckData);
        } else {
          console.log(
            `${newCheckData.id} outcome unchanged, no alert needed for ${
              newCheckData.url
            }`
          );
        }
      } else {
        console.log(`Error saving updates to check ${newCheckData.id}`);
      }
    });
  },

  // Alert user to a change in their check status
  alertUserToStatusChange(newCheckData) {
    const msg = `Alert: your check for ${newCheckData.method} ${
      newCheckData.protocol
    }://${newCheckData.url} is currently ${newCheckData.state}.`;
    helpers.sendTwilioSms(newCheckData.userPhone, msg, err => {
      if (!err) {
        console.log('Success: User alerted to status change via sms', msg);
      } else {
        console.log(
          'Error: Could not send sms alert to user',
          `Message: ${msg}`,
          `Error: ${err}`
        );
      }
    });
  },
};

// Export module
module.exports = workers;
