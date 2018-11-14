/**
 * Test runner
 */

// Override NODE_ENV variable
process.env.NODE_ENV = 'testing';

// Dependencies
const cli = require('../lib/cli');
const unitTests = require('./unit');
const apiTests = require('./api');

// Logic runner for test runner
const app = {
  // Run all the tests, collecting errors and successes
  runTests() {
    const errors = [];
    let successes = 0;
    const limit = this.countTests();
    let counter = 0;
    for (let key in this.tests) {
      if (this.tests.hasOwnProperty(key)) {
        const subTests = this.tests[key];
        for (let testName in subTests) {
          if (subTests.hasOwnProperty(testName)) {
            (function() {
              let tempTestName = testName;
              let testValue = subTests[testName];
              // Call the test
              try {
                testValue(() => {
                  // If it calls back without throwing, it succeeded. Log it in green
                  console.log('\x1b[32m%s\x1b[0m', tempTestName);
                  counter++;
                  successes++;
                  if (counter === limit) {
                    app.produceTestReport(limit, successes, errors);
                  }
                });
              } catch (e) {
                // If it throws, then it failed. Capture error thrown and log it in red
                errors.push({
                  name: testName,
                  error: e,
                });
                console.log('\x1b[31m%s\x1b[0m', tempTestName);
                counter++;
                if (counter === limit) {
                  app.produceTestReport(limit, successes, errors);
                }
              }
            })();
          }
        }
      }
    }
  },

  // Count all the tests
  countTests() {
    let counter = 0;
    for (let key in this.tests) {
      if (this.tests.hasOwnProperty(key)) {
        const subTests = this.tests[key];
        for (let testName in subTests) {
          if (subTests.hasOwnProperty(testName)) {
            counter++;
          }
        }
      }
    }
    return counter;
  },

  // Produce a test outcome report
  produceTestReport(limit, successes, errors) {
    cli.horizontalLine();
    cli.centered('BEGIN TEST REPORT');
    cli.horizontalLine();
    cli.verticalSpace();

    console.log('\x1b[33mTotal Tests: \x1b[0m', limit);
    cli.verticalSpace();
    console.log('\x1b[33mPass: \x1b[0m', successes);
    cli.verticalSpace();
    console.log('\x1b[33mFail: \x1b[0m', errors.length);

    // If there are any errors, print them in detail
    if (errors.length > 0) {
      cli.centered('ERROR DETAILS');
      cli.horizontalLine();
      cli.verticalSpace();

      errors.forEach(testError => {
        console.log('\x1b[31m%s\x1b[0m', testError.name);
        console.log(testError.error);
        cli.verticalSpace();
      });
    }

    cli.horizontalLine();
    cli.centered('END TEST REPORT');
    cli.horizontalLine();
    cli.verticalSpace();
    process.exit(0);
  },

  // Container for tests
  tests: {
    unit: unitTests,
    api: apiTests,
  },
};

// Run the tests
app.runTests();
