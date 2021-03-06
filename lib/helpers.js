/**
 * Helpers for various tasks
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');

// Cotnainer for all helpers
const helpers = {
  // Create a SHA256 hash
  hash(str) {
    if (typeof str === 'string' && str.length > 0) {
      const hash = crypto
        .createHmac('sha256', config.hashingSecret)
        .update(str)
        .digest('hex');
      return hash;
    } else {
      return false;
    }
  },

  // Creating separate parse method so that Node doesn't just
  // throw like it normally would when using JSON.parse
  // if incoming str isn't valid json
  parseJson(str) {
    try {
      const obj = JSON.parse(str);
      return obj;
    } catch (e) {
      return {};
    }
  },

  // Create string of given length
  createRandomString(strLength) {
    strLength =
      typeof strLength === 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
      const possibleChars =
        'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789';
      let str = '';
      while (str.length < strLength) {
        // Append random char from possibleChars
        str += possibleChars[Math.floor(Math.random() * possibleChars.length)];
      }
      // Return final string
      return str;
    } else {
      return false;
    }
  },

  // Send an SMS via Twilio
  sendTwilioSms(phone, msg, callback) {
    // Validate params
    phone =
      typeof phone === 'string' && phone.trim().length === 10 ? phone : false;
    msg =
      typeof msg === 'string' &&
      msg.trim().length > 0 &&
      msg.trim().length <= 1600
        ? msg
        : false;
    if (phone && msg) {
      // Configure request payload to send to Twilio
      const payload = {
        From: config.twilio.fromPhone,
        To: '+1' + phone,
        Body: msg,
      };
      // Stringify payload
      const stringPayload = querystring.stringify(payload);

      // Configure request details
      const requestDetails = {
        protocol: 'https:',
        hostname: 'api.twilio.com',
        method: 'POST',
        path: `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
        auth: `${config.twilio.accountSid}:${config.twilio.authToken}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(stringPayload),
        },
      };

      // Instantiate request object
      const req = https.request(requestDetails, res => {
        // Grab status of sent request
        const status = res.statusCode;
        // Callback successfully if request went through
        if (status === 200 || status === 201) {
          callback(false);
        } else {
          callback(`Status code returned was ${status}`);
        }
      });

      // Bind to the error event so it doesn't get thrown
      req.on('error', e => {
        callback(e);
      });

      // Add payload
      req.write(stringPayload);

      // End request
      req.end();
    } else {
      callback('Required parameters missing or invalid');
    }
  },

  // Get the string content of a template
  getTemplate(templateName, data, callback) {
    // Sanity check the template name
    templateName =
      typeof templateName === 'string' && templateName.length > 0
        ? templateName
        : false;
    data = typeof data === 'object' && data !== null ? data : {};
    if (templateName) {
      const templatesDir = path.join(__dirname, '/../templates/');
      fs.readFile(`${templatesDir}${templateName}.html`, 'utf8', (err, str) => {
        if (!err && str && str.length > 0) {
          // Do interpolation on str before returning
          const finalString = helpers.interpolate(str, data);
          callback(false, finalString);
        } else {
          callback('Unable to find template');
        }
      });
    } else {
      callback('Valid template name was not specified');
    }
  },

  // Add the universal header and footer to a string and pass the data obj
  // to header and footer for interpolation
  addUniversalTemplates(str, data, callback) {
    str = typeof str === 'string' && str.length > 0 ? str : '';
    data = typeof data === 'object' && data !== null ? data : {};
    // Get header
    helpers.getTemplate('_header', data, (err, headerString) => {
      if (!err && headerString) {
        helpers.getTemplate('_footer', data, (err, footerString) => {
          if (!err && footerString) {
            // Add strings together
            const fullString = headerString + str + footerString;
            callback(false, fullString);
          } else {
            callback('Could not find footer template');
          }
        });
      } else {
        callback('Could not find header template');
      }
    });
  },

  // Take a given string and a data object
  // Find/replace all the keys within it
  interpolate(str, data) {
    str = typeof str === 'string' && str.length > 0 ? str : '';
    data = typeof data === 'object' && data !== null ? data : {};

    // Add the templateGlobals to the data object, prepending their key name with "global"
    for (let keyName in config.templateGlobals) {
      if (config.templateGlobals.hasOwnProperty(keyName)) {
        data[`global.${keyName}`] = config.templateGlobals[keyName];
      }
    }

    // For each key in the data object, insert its value into the string at the corresponding location
    for (let key in data) {
      if (data.hasOwnProperty(key) && typeof data[key] === 'string') {
        const replace = data[key];
        const find = `{${key}}`;
        str = str.replace(find, replace);
      }
    }

    return str;
  },

  // Get the contents of a static (public) asset
  getStaticAsset(fileName, callback) {
    fileName =
      typeof fileName === 'string' && fileName.length > 0 ? fileName : false;

    if (fileName) {
      const publicDir = path.join(__dirname, '/../public/');
      fs.readFile(`${publicDir}${fileName}`, (err, data) => {
        if (!err && data) {
          callback(false, data);
        } else {
          callback('File not found');
        }
      });
    } else {
      callback('A valid file name was not specified');
    }
  },

  // Sample for testing
  getANumber() {
    return 1;
  },
};

// Export the module
module.exports = helpers;
