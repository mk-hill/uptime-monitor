/**
 * Request handlers
 */

// Dependencies
const dataLib = require('./data');
const helpers = require('./helpers');

// Define handlers
const handlers = {
  users(data, callback) {
    const validMethods = ['post', 'get', 'put', 'delete'];
    if (validMethods.includes(data.method)) {
      handlers._users[data.method](data, callback);
    } else {
      callback(405);
    }
  },

  // Just responding with 200
  ping(data, callback) {
    callback(200);
  },

  notFound(data, callback) {
    callback(404);
  },

  // Container for users handler submethods
  _users: {
    // Required data: firstName, lastName, phone, password, tosAgreement
    // Optional data: none
    post(data, callback) {
      // Check that all required fields are filled out
      const firstName =
        typeof data.payload.firstName === 'string' &&
        data.payload.firstName.trim().length > 0
          ? data.payload.firstName.trim()
          : false;
      const lastName =
        typeof data.payload.lastName === 'string' &&
        data.payload.lastName.trim().length > 0
          ? data.payload.lastName.trim()
          : false;
      const phone =
        typeof data.payload.phone === 'string' &&
        data.payload.phone.trim().length === 10
          ? data.payload.phone.trim()
          : false;
      const password =
        typeof data.payload.password === 'string' &&
        data.payload.password.trim().length > 0
          ? data.payload.password.trim()
          : false;
      const tosAgreement =
        data.payload.tosAgreement === true ? data.payload.tosAgreement : false;

      if (firstName && lastName && phone && password && tosAgreement) {
        // Ensure user dopesn't already exist
        // Check unique phone number.json does not exist in /data
        dataLib.read('users', phone, (err, data) => {
          // dataLib will return err if file does not exist
          if (err) {
            // Hash the password
            const hashedPassword = helpers.hash(password);

            // Ensure password got hashed properly
            if (hashedPassword) {
              // Create user obj
              const userObj = {
                firstName,
                lastName,
                phone,
                hashedPassword,
                tosAgreement: true,
              };

              // Store user
              dataLib.create('users', phone, userObj, err => {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { error: 'Could not create new user' });
                }
              });
            } else {
              callback(500, { error: 'Could not hash the user\'s password' });
            }
          } else {
            callback(400, {
              error: 'A user with that phone number already exists',
            });
          }
        });
      } else {
        callback(400, { error: 'missing required fields' });
      }
    },

    // Required data: phone
    // Optional data: none
    // todo Only let authenticated users access their own obj, not anyone elses
    get(data, callback) {
      // Validate phone number
      const phone =
        typeof data.queryStringObj.phone === 'string' &&
        data.queryStringObj.phone.trim().length === 10
          ? data.queryStringObj.phone.trim()
          : false;
      if (phone) {
        dataLib.read('users', phone, (err, parsedUser) => {
          if (!err && parsedUser) {
            // Remove the hashed password from user obj before returning to requester
            delete parsedUser.hashedPassword;
            callback(200, parsedUser);
          } else {
            callback(404);
          }
        });
      } else {
        callback(400, { error: 'Missing required field' });
      }
    },

    // Required data: phone
    // Optional data: firstName, lastName, password (at least one must be specified)
    // todo Only let authenticated users update their own obj, not anyone elses
    put(data, callback) {
      // Check for the required field
      const phone =
        typeof data.payload.phone === 'string' &&
        data.payload.phone.trim().length === 10
          ? data.payload.phone.trim()
          : false;

      // Check for optional fields
      const firstName =
        typeof data.payload.firstName === 'string' &&
        data.payload.firstName.trim().length > 0
          ? data.payload.firstName.trim()
          : false;
      const lastName =
        typeof data.payload.lastName === 'string' &&
        data.payload.lastName.trim().length > 0
          ? data.payload.lastName.trim()
          : false;
      const password =
        typeof data.payload.password === 'string' &&
        data.payload.password.trim().length > 0
          ? data.payload.password.trim()
          : false;

      // Error if phone is invalid
      if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {
          // Lookup user
          dataLib.read('users', phone, (err, userData) => {
            if (!err && userData) {
              // Update fields if necessary
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }
              // Store the new updates
              dataLib.update('users', phone, userData, err => {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { error: 'Could not update the user' });
                }
              });
            } else {
              callback(400, { error: 'User does not exist' });
            }
          });
        } else {
          callback(400, { error: 'Missing fields to update' });
        }
      } else {
        callback(400, { error: 'Missing required field' });
      }
    },

    // Required data: phone
    // Optional data: none
    // todo Only let authenticated users delete their own obj, not anyone elses
    // todo Cleanup (delete) any other data files associated with this user
    delete(data, callback) {
      // Validate phone number
      const phone =
        typeof data.queryStringObj.phone === 'string' &&
        data.queryStringObj.phone.trim().length === 10
          ? data.queryStringObj.phone.trim()
          : false;
      if (phone) {
        dataLib.read('users', phone, (err, parsedUser) => {
          if (!err && parsedUser) {
            dataLib.delete('users', phone, err => {
              if (!err) {
                callback(200);
              } else {
                callback(500, { error: 'Could not delete specified user' });
              }
            });
          } else {
            callback(400, { error: 'Could not find specified user' });
          }
        });
      } else {
        callback(400, { error: 'Missing required field' });
      }
    },
  },
};

module.exports = handlers;
