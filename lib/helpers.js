/**
 * Helpers for various tasks
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');

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
};

// Export the module
module.exports = helpers;
