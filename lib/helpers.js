/**
 * Helpers for various tasks
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');

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
};

// Export the module
module.exports = helpers;
