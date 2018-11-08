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

// Instantiate worker object
const workers = {
  // Init script
  init() {
    // Execute all the checks immediately
    this.gatherAllChecks();
    // Call a loop to have checks continue executing on their own
    this.loop();
  },

  // Timer to execute checks once per minute
  loop() {
    setInterval(() => {
      this.gatherAllChecks();
    }, 1000 * 60);
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
  performCheck(originalCheckData) {},
};

// Export module
module.exports = workers;
