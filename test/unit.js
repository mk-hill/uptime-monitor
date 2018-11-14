/**
 * Unit tests
 */

// Dependencies
const helpers = require('../lib/helpers');
const assert = require('assert');
const logs = require('../lib/logs');

// Container for unit tests
const unit = {
  'logs.list should call back a false error and an array of log names'(done) {
    logs.list(true, (err, logFileNames) => {
      // Assert error is false
      assert.equal(err, false);

      // Assert file names returned as array
      assert.ok(logFileNames instanceof Array);
      assert.ok(logFileNames.length > 1);
      done();
    });
  },

  'logs.truncate should not throw if the logId doesn\'t exist, should call back error instead'(
    done
  ) {
    assert.doesNotThrow(() => {
      logs.truncate('nonexistent id', err => {
        // Should have called back error
        assert.ok(err);
        done();
      });
    }, TypeError);
  },

  'getANumber should return a number type'(done) {
    const val = helpers.getANumber();
    assert.equal(typeof val, 'number');
    done();
  },

  'getANumber should return 1'(done) {
    const val = helpers.getANumber();
    assert.equal(val, 1);
    done();
  },

  'getANumber should return 2'(done) {
    const val = helpers.getANumber();
    assert.equal(val, 2);
    done();
  },
};

// Export module to test runner
module.exports = unit;
