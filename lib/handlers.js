/**
 * Request handlers
 */

// Dependencies
const dataLib = require('./data');
const helpers = require('./helpers');
const config = require('./config');

// Define handlers
const handlers = {
  // Just responding with 200
  ping(data, callback) {
    callback(200);
  },

  notFound(data, callback) {
    callback(404);
  },

  /**
   * ─── HTML HANDLERS ──────────────────────────────────────────────────────────
   * Handlers related to html in this section
   */

  // Index handler
  index(data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
      // Prepare data for interpolation
      const templateData = {
        'head.title': 'Home',
        'head.description':
          'Simple uptime monitoring for HTTP/HTTPS sites. Receive sms alerts when your site goes up or down.',
        'body.title': 'Hello templated world!',
        'body.class': 'index',
      };

      // Read in html template as a string
      helpers.getTemplate('index', templateData, (err, str) => {
        if (!err && str) {
          // Add universal header and footer
          helpers.addUniversalTemplates(
            str,
            templateData,
            (err, finalString) => {
              if (!err && finalString) {
                // Return final page as HTML
                callback(200, finalString, 'html');
              } else {
                callback(500, undefined, 'html');
              }
            }
          );
        } else {
          callback(500, undefined, 'html');
        }
      });
    } else {
      callback(405, undefined, 'html');
    }
  },

  // Sign up handler
  accountCreate(data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
      // Prepare data for interpolation
      const templateData = {
        'head.title': 'Sign Up',
        'head.description': 'Signing up is easy. It only takes a few seconds.',
        'body.class': 'accountCreate',
      };

      // Read in html template as a string
      helpers.getTemplate('accountCreate', templateData, (err, str) => {
        if (!err && str) {
          // Add universal header and footer
          helpers.addUniversalTemplates(
            str,
            templateData,
            (err, finalString) => {
              if (!err && finalString) {
                // Return final page as HTML
                callback(200, finalString, 'html');
              } else {
                callback(500, undefined, 'html');
              }
            }
          );
        } else {
          callback(500, undefined, 'html');
        }
      });
    } else {
      callback(405, undefined, 'html');
    }
  },

  // Log in handler
  sessionCreate(data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
      // Prepare data for interpolation
      const templateData = {
        'head.title': 'Log In',
        'head.description':
          'Enter your phone number and password to access your account.',
        'body.class': 'sessionCreate',
      };

      // Read in html template as a string
      helpers.getTemplate('sessionCreate', templateData, (err, str) => {
        if (!err && str) {
          // Add universal header and footer
          helpers.addUniversalTemplates(
            str,
            templateData,
            (err, finalString) => {
              if (!err && finalString) {
                // Return final page as HTML
                callback(200, finalString, 'html');
              } else {
                callback(500, undefined, 'html');
              }
            }
          );
        } else {
          callback(500, undefined, 'html');
        }
      });
    } else {
      callback(405, undefined, 'html');
    }
  },

  // Log out handler
  sessionDeleted(data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
      // Prepare data for interpolation
      const templateData = {
        'head.title': 'Logged Out',
        'head.description': 'You have been logged out of your account.',
        'body.class': 'sessionDeleted',
      };

      // Read in html template as a string
      helpers.getTemplate('sessionDeleted', templateData, (err, str) => {
        if (!err && str) {
          // Add universal header and footer
          helpers.addUniversalTemplates(
            str,
            templateData,
            (err, finalString) => {
              if (!err && finalString) {
                // Return final page as HTML
                callback(200, finalString, 'html');
              } else {
                callback(500, undefined, 'html');
              }
            }
          );
        } else {
          callback(500, undefined, 'html');
        }
      });
    } else {
      callback(405, undefined, 'html');
    }
  },

  // Edit account handler
  accountEdit(data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
      // Prepare data for interpolation
      const templateData = {
        'head.title': 'Account Settings',
        'body.class': 'accountEdit',
      };

      // Read in html template as a string
      helpers.getTemplate('accountEdit', templateData, (err, str) => {
        if (!err && str) {
          // Add universal header and footer
          helpers.addUniversalTemplates(
            str,
            templateData,
            (err, finalString) => {
              if (!err && finalString) {
                // Return final page as HTML
                callback(200, finalString, 'html');
              } else {
                callback(500, undefined, 'html');
              }
            }
          );
        } else {
          callback(500, undefined, 'html');
        }
      });
    } else {
      callback(405, undefined, 'html');
    }
  },

  // Delete account handler
  accountDeleted(data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
      // Prepare data for interpolation
      const templateData = {
        'head.title': 'Account Deleted',
        'head.description': 'Your account has been deleted.',
        'body.class': 'accountDeleted',
      };

      // Read in html template as a string
      helpers.getTemplate('accountDeleted', templateData, (err, str) => {
        if (!err && str) {
          // Add universal header and footer
          helpers.addUniversalTemplates(
            str,
            templateData,
            (err, finalString) => {
              if (!err && finalString) {
                // Return final page as HTML
                callback(200, finalString, 'html');
              } else {
                callback(500, undefined, 'html');
              }
            }
          );
        } else {
          callback(500, undefined, 'html');
        }
      });
    } else {
      callback(405, undefined, 'html');
    }
  },

  // Create check handler
  checksCreate(data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
      // Prepare data for interpolation
      const templateData = {
        'head.title': 'Create a New Check',
        'body.class': 'checksCreate',
      };

      // Read in html template as a string
      helpers.getTemplate('checksCreate', templateData, (err, str) => {
        if (!err && str) {
          // Add universal header and footer
          helpers.addUniversalTemplates(
            str,
            templateData,
            (err, finalString) => {
              if (!err && finalString) {
                // Return final page as HTML
                callback(200, finalString, 'html');
              } else {
                callback(500, undefined, 'html');
              }
            }
          );
        } else {
          callback(500, undefined, 'html');
        }
      });
    } else {
      callback(405, undefined, 'html');
    }
  },

  // Checks dashboard handler
  checksList(data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
      // Prepare data for interpolation
      const templateData = {
        'head.title': 'Dashboard',
        'body.class': 'checksList',
      };

      // Read in html template as a string
      helpers.getTemplate('checksList', templateData, (err, str) => {
        if (!err && str) {
          // Add universal header and footer
          helpers.addUniversalTemplates(
            str,
            templateData,
            (err, finalString) => {
              if (!err && finalString) {
                // Return final page as HTML
                callback(200, finalString, 'html');
              } else {
                callback(500, undefined, 'html');
              }
            }
          );
        } else {
          callback(500, undefined, 'html');
        }
      });
    } else {
      callback(405, undefined, 'html');
    }
  },

  // Edit check handler
  checksEdit(data, callback) {
    // Reject any request that isn't a GET
    if (data.method === 'get') {
      // Prepare data for interpolation
      const templateData = {
        'head.title': 'Edit Check',
        'body.class': 'checksEdit',
      };

      // Read in html template as a string
      helpers.getTemplate('checksEdit', templateData, (err, str) => {
        if (!err && str) {
          // Add universal header and footer
          helpers.addUniversalTemplates(
            str,
            templateData,
            (err, finalString) => {
              if (!err && finalString) {
                // Return final page as HTML
                callback(200, finalString, 'html');
              } else {
                callback(500, undefined, 'html');
              }
            }
          );
        } else {
          callback(500, undefined, 'html');
        }
      });
    } else {
      callback(405, undefined, 'html');
    }
  },

  // Favicon handler
  favicon(data, callback) {
    if (data.method === 'get') {
      // Read in favicon data
      helpers.getStaticAsset('favicon.ico', (err, data) => {
        if (!err && data) {
          // Callback data and type
          callback(200, data, 'favicon');
        } else {
          callback(500);
        }
      });
    } else {
      callback(405);
    }
  },

  // Public assets
  public(data, callback) {
    if (data.method === 'get') {
      // Get requested filename
      const trimmedAssetName = data.trimmedPath.replace('public', '').trim();
      if (trimmedAssetName.length > 0) {
        // Read asset's data
        helpers.getStaticAsset(trimmedAssetName, (err, data) => {
          if (!err && data) {
            // Determine content type, default to plain text
            let contentType = 'plain';
            if (trimmedAssetName.includes('.css')) {
              contentType = 'css';
            }

            if (trimmedAssetName.includes('.png')) {
              contentType = 'png';
            }

            if (trimmedAssetName.includes('.jpg')) {
              contentType = 'jpg';
            }

            if (trimmedAssetName.includes('.ico')) {
              contentType = 'favicon';
            }

            // Callback data
            callback(200, data, contentType);
          } else {
            callback(404);
          }
        });
      } else {
        callback(404);
      }
    } else {
      callback(405);
    }
  },

  /**
   * ─── JSON API HANDLERS ──────────────────────────────────────────────────────────
   * Handlers related to api in this section
   */

  // Users handler
  users(data, callback) {
    const validMethods = ['post', 'get', 'put', 'delete'];
    if (validMethods.includes(data.method)) {
      handlers._users[data.method](data, callback);
    } else {
      callback(405);
    }
  },

  // Tokens handler
  tokens(data, callback) {
    const validMethods = ['post', 'get', 'put', 'delete'];
    if (validMethods.includes(data.method)) {
      handlers._tokens[data.method](data, callback);
    } else {
      callback(405);
    }
  },

  // Checks handler
  checks(data, callback) {
    const validMethods = ['post', 'get', 'put', 'delete'];
    if (validMethods.includes(data.method)) {
      handlers._checks[data.method](data, callback);
    } else {
      callback(405);
    }
  },

  // Container for users handler submethods
  _users: {
    // * Users - post *
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

    // * Users - get *
    // Required data: phone
    // Optional data: none
    get(data, callback) {
      // Validate phone number
      const phone =
        typeof data.queryStringObj.phone === 'string' &&
        data.queryStringObj.phone.trim().length === 10
          ? data.queryStringObj.phone.trim()
          : false;
      if (phone) {
        // * Only let authenticated users access their own obj, not anyone elses
        // Get token from headers client sent
        const token =
          typeof data.headers.token === 'string' &&
          data.headers.token.trim().length === 20
            ? data.headers.token.trim()
            : false;
        // Verify token is active and valid for the phone number
        handlers._tokens.verifyToken(token, phone, tokenIsValid => {
          if (tokenIsValid) {
            // Lookup user
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
            callback(403, { error: 'Token missing or invalid' });
          }
        });
      } else {
        callback(400, { error: 'Missing required field' });
      }
    },

    // * Users - put *
    // Required data: phone
    // Optional data: firstName, lastName, password (at least one must be specified)
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
        // * Only let authenticated users update their own obj, not anyone elses
        // Get token from headers client sent
        const token =
          typeof data.headers.token === 'string' &&
          data.headers.token.trim().length === 20
            ? data.headers.token.trim()
            : false;
        // Verify token is active and valid for the phone number
        handlers._tokens.verifyToken(token, phone, tokenIsValid => {
          if (tokenIsValid) {
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
            callback(403, { error: 'Token missing or invalid' });
          }
        });
      } else {
        callback(400, { error: 'Missing required field' });
      }
    },

    // * Users - delete *
    // Required data: phone
    // Optional data: none
    delete(data, callback) {
      // Validate phone number
      const phone =
        typeof data.queryStringObj.phone === 'string' &&
        data.queryStringObj.phone.trim().length === 10
          ? data.queryStringObj.phone.trim()
          : false;
      if (phone) {
        // * Only let authenticated users delete their own obj, not anyone elses
        // Get token from headers client sent
        const token =
          typeof data.headers.token === 'string' &&
          data.headers.token.trim().length === 20
            ? data.headers.token.trim()
            : false;
        // Verify token is active and valid for the phone number
        handlers._tokens.verifyToken(token, phone, tokenIsValid => {
          if (tokenIsValid) {
            dataLib.read('users', phone, (err, userData) => {
              if (!err && userData) {
                dataLib.delete('users', phone, err => {
                  if (!err) {
                    // Delete any check data files associated with this user
                    const userChecks =
                      typeof userData.checks === 'object' &&
                      userData.checks instanceof Array
                        ? userData.checks
                        : [];
                    const checksToDelete = userChecks.length;
                    if (checksToDelete > 0) {
                      let checksDeleted = 0;
                      let deletionErrors = false;
                      // Loop through checks
                      userChecks.forEach(checkId => {
                        // Delete check
                        dataLib.delete('checks', checkId, err => {
                          if (err) {
                            deletionErrors = true;
                          }
                          checksDeleted++;
                          if (checksDeleted === checksToDelete) {
                            if (!deletionErrors) {
                              callback(200);
                            } else {
                              callback(500, {
                                error:
                                  'Errors encountered while attempting to delete all checks',
                              });
                            }
                          }
                        });
                      });
                    } else {
                      callback(200);
                    }
                  } else {
                    callback(500, { error: 'Could not delete specified user' });
                  }
                });
              } else {
                callback(400, { error: 'Could not find specified user' });
              }
            });
          } else {
            callback(403, { error: 'Token missing or invalid' });
          }
        });
      } else {
        callback(400, { error: 'Missing required field' });
      }
    },
  },

  // Container for tokens handler submethods
  _tokens: {
    // * Tokens - post *
    // Required data: phone, password
    // Optional data: none
    post(data, callback) {
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
      if (phone && password) {
        // Lookup user who matches phone number
        dataLib.read('users', phone, (err, userData) => {
          if (!err && userData) {
            // Hash the sent password, compare it to stored hash
            const hashedPassword = helpers.hash(password);
            if (hashedPassword === userData.hashedPassword) {
              // If valid, create a new token with random name.
              const tokenId = helpers.createRandomString(20);
              // Set expiration date 1 hour in the future
              const expires = Date.now() + 1000 * 3600;
              const tokenObj = {
                phone,
                id: tokenId,
                expires,
              };

              // Store the token
              dataLib.create('tokens', tokenId, tokenObj, err => {
                if (!err) {
                  callback(200, tokenObj);
                } else {
                  callback(500, { error: 'Could not create new token' });
                }
              });
            } else {
              callback(400, {
                error: 'Incorrect password and number combination',
              });
            }
          } else {
            callback(400, { error: 'Could not find the specified user' });
          }
        });
      } else {
        callback(400, {
          error: 'Missing required field(s) or field(s) are invalid',
        });
      }
    },

    // * Tokens - get *
    // Required data: id
    // Optional data: none
    get(data, callback) {
      // Validate token id string
      const id =
        typeof data.queryStringObj.id === 'string' &&
        data.queryStringObj.id.trim().length === 20
          ? data.queryStringObj.id.trim()
          : false;
      if (id) {
        dataLib.read('tokens', id, (err, tokenData) => {
          if (!err && tokenData) {
            callback(200, tokenData);
          } else {
            callback(404);
          }
        });
      } else {
        callback(400, { error: 'Missing required field' });
      }
    },

    // * Tokens - put *
    // Only use for put req to tokens is to extend expiration but user
    // should not determine extension time. Will add 1hr if extend:true
    // Required data: id, extend
    // Optional data: none
    put(data, callback) {
      // Validate token id and extend
      const id =
        typeof data.payload.id === 'string' &&
        data.payload.id.trim().length === 20
          ? data.payload.id.trim()
          : false;
      const extend = data.payload.extend === true ? true : false;
      if (id && extend) {
        // Lookup token
        dataLib.read('tokens', id, (err, tokenData) => {
          if (!err && tokenData) {
            // Ensure token isn't expired
            if (tokenData.expires > Date.now()) {
              // Set expiration date 1 hour in the future
              tokenData.expires = Date.now() + 1000 * 3600;
              // Store updated token
              dataLib.update('tokens', id, tokenData, err => {
                if (!err) {
                  callback(200);
                } else {
                  callback(500, {
                    error: 'Unable to update token',
                  });
                }
              });
            } else {
              callback(400, {
                error: 'Token has expired and cannot be extended',
              });
            }
          } else {
            callback(400, { error: 'Specified token does not exist' });
          }
        });
      } else {
        callback(400, {
          error: 'Missing required field(s) or field(s) are invalid',
        });
      }
    },

    // * Tokens - delete *
    // Required data: id
    // Optional data: none
    delete(data, callback) {
      // Validate id number
      const id =
        typeof data.payload.id === 'string' &&
        data.payload.id.trim().length === 20
          ? data.payload.id.trim()
          : false;
      if (id) {
        dataLib.read('tokens', id, (err, tokenData) => {
          if (!err && tokenData) {
            dataLib.delete('tokens', id, err => {
              if (!err) {
                callback(200);
              } else {
                callback(500, { error: 'Could not delete specified token' });
              }
            });
          } else {
            callback(400, { error: 'Could not find specified token' });
          }
        });
      } else {
        callback(400, { error: 'Missing required field' });
      }
    },

    // Verify if a given token id is currently valid for a given user
    verifyToken(id, phone, callback) {
      // Lookup token
      dataLib.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
          if (tokenData.phone === phone && tokenData.expires > Date.now()) {
            callback(true);
          } else {
            callback(false);
          }
        } else {
          callback(false);
        }
      });
    },
  },

  // Container for checks handler submethods
  _checks: {
    // * Checks - post *
    // Required data: protocol, url, method, successCodes, timeoutSeconds
    // Optional data: none
    post(data, callback) {
      // Validate inputs
      const protocol =
        typeof data.payload.protocol === 'string' &&
        ['https', 'http'].includes(data.payload.protocol)
          ? data.payload.protocol
          : false;
      const url =
        typeof data.payload.url === 'string' &&
        data.payload.url.trim().length > 0
          ? data.payload.url.trim()
          : false;
      const method =
        typeof data.payload.method === 'string' &&
        ['post', 'get', 'put', 'delete'].includes(data.payload.method)
          ? data.payload.method
          : false;
      const successCodes =
        typeof data.payload.successCodes === 'object' &&
        data.payload.successCodes instanceof Array &&
        data.payload.successCodes.length > 0
          ? data.payload.successCodes
          : false;
      const timeoutSeconds =
        typeof data.payload.timeoutSeconds === 'number' &&
        data.payload.timeoutSeconds % 1 === 0 &&
        data.payload.timeoutSeconds >= 1 &&
        data.payload.timeoutSeconds <= 5
          ? data.payload.timeoutSeconds
          : false;
      if (protocol && url && method && successCodes && timeoutSeconds) {
        // Get token from headers
        const token =
          typeof data.headers.token === 'string' &&
          data.headers.token.trim().length === 20
            ? data.headers.token.trim()
            : false;
        // Lookup token
        dataLib.read('tokens', token, (err, tokenData) => {
          if (!err && tokenData) {
            const userPhone = tokenData.phone;

            // Lookup user data
            dataLib.read('users', userPhone, (err, userData) => {
              if (!err && userData) {
                // Get user checks or create new array if none
                const userChecks =
                  typeof userData.checks === 'object' &&
                  userData.checks instanceof Array
                    ? userData.checks
                    : [];
                // Verify that the user has less than the max allowed checks
                if (userChecks.length < config.maxChecks) {
                  // Create a random id for the check
                  const checkId = helpers.createRandomString(20);

                  // Create check object and include user's phone
                  const checkObj = {
                    id: checkId,
                    userPhone,
                    protocol,
                    url,
                    method,
                    successCodes,
                    timeoutSeconds,
                  };

                  // Store object
                  dataLib.create('checks', checkId, checkObj, err => {
                    if (!err) {
                      // Add check id to user's object
                      userData.checks = userChecks;
                      userData.checks.push(checkId);

                      // Save new user data
                      dataLib.update('users', userPhone, userData, err => {
                        if (!err) {
                          // Return new check data
                          callback(200, checkObj);
                        } else {
                          callback(500, {
                            error: 'Unable to update user with new check',
                          });
                        }
                      });
                    } else {
                      callback(500, { error: 'Unable to create new check' });
                    }
                  });
                } else {
                  callback(400, {
                    error: `Maximum checks per user: ${config.maxChecks}`,
                  });
                }
              } else {
                callback(403);
              }
            });
          } else {
            callback(403);
          }
        });
      } else {
        callback(400, { error: 'Required inputs missing or invalid' });
      }
    },

    // * Checks - get *
    // Required data: id
    // Optional data: none
    get(data, callback) {
      // Validate id
      const id =
        typeof data.queryStringObj.id === 'string' &&
        data.queryStringObj.id.trim().length === 20
          ? data.queryStringObj.id.trim()
          : false;
      if (id) {
        // Lookup check
        dataLib.read('checks', id, (err, checkData) => {
          if (!err && checkData) {
            // * Only let authenticated users access their own checks, not anyone elses
            // Get token from headers client sent
            const token =
              typeof data.headers.token === 'string' &&
              data.headers.token.trim().length === 20
                ? data.headers.token.trim()
                : false;
            // Verify token is active and valid for the user
            handlers._tokens.verifyToken(
              token,
              checkData.userPhone,
              tokenIsValid => {
                if (tokenIsValid) {
                  callback(200, checkData);
                } else {
                  callback(403, { error: 'Token missing or invalid' });
                }
              }
            );
          } else {
            callback(404);
          }
        });
      } else {
        callback(400, { error: 'Missing required field' });
      }
    },

    // * Checks - put *
    // Required data: id
    // Optional data: protocol, url, method, successCodes, timeoutSeconds
    // (at least one required)
    put(data, callback) {
      // Check for the required field
      const id =
        typeof data.payload.id === 'string' &&
        data.payload.id.trim().length === 20
          ? data.payload.id.trim()
          : false;

      // Check for optional fields
      const protocol =
        typeof data.payload.protocol === 'string' &&
        ['https', 'http'].includes(data.payload.protocol)
          ? data.payload.protocol
          : false;
      const url =
        typeof data.payload.url === 'string' &&
        data.payload.url.trim().length > 0
          ? data.payload.url.trim()
          : false;
      const method =
        typeof data.payload.method === 'string' &&
        ['post', 'get', 'put', 'delete'].includes(data.payload.method)
          ? data.payload.method
          : false;
      const successCodes =
        typeof data.payload.successCodes === 'object' &&
        data.payload.successCodes instanceof Array &&
        data.payload.successCodes.length > 0
          ? data.payload.successCodes
          : false;
      const timeoutSeconds =
        typeof data.payload.timeoutSeconds === 'number' &&
        data.payload.timeoutSeconds % 1 === 0 &&
        data.payload.timeoutSeconds >= 1 &&
        data.payload.timeoutSeconds <= 5
          ? data.payload.timeoutSeconds
          : false;

      // Continue if id is valid
      if (id) {
        // Ensure at least one of the optional fields was sent
        if (protocol || url || method || successCodes || timeoutSeconds) {
          // Lookup the check
          dataLib.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
              // * Only let authenticated users access their own checks, not anyone elses
              // Get token from headers client sent
              const token =
                typeof data.headers.token === 'string' &&
                data.headers.token.trim().length === 20
                  ? data.headers.token.trim()
                  : false;
              // Verify token is active and valid for the user
              handlers._tokens.verifyToken(
                token,
                checkData.userPhone,
                tokenIsValid => {
                  if (tokenIsValid) {
                    // Update check where necessary
                    if (protocol) {
                      checkData.protocol = protocol;
                    }
                    if (url) {
                      checkData.url = url;
                    }
                    if (method) {
                      checkData.method = method;
                    }
                    if (successCodes) {
                      checkData.successCodes = successCodes;
                    }
                    if (timeoutSeconds) {
                      checkData.timeoutSeconds = timeoutSeconds;
                    }

                    // Store updates
                    dataLib.update('checks', id, checkData, err => {
                      if (!err) {
                        callback(200);
                      } else {
                        callback(500, { error: 'Unable to update check' });
                      }
                    });
                  } else {
                    callback(403, { error: 'Token missing or invalid' });
                  }
                }
              );
            } else {
              callback(400, { error: 'Check ID does not exist' });
            }
          });
        } else {
          callback(400, { error: 'Missing field(s) to update' });
        }
      } else {
        callback(400, { error: 'Missing required field' });
      }
    },

    // * Checks - delete *
    // Required data: id
    // Optional data: none
    delete(data, callback) {
      // Validate phone number
      const id =
        typeof data.queryStringObj.id === 'string' &&
        data.queryStringObj.id.trim().length === 20
          ? data.queryStringObj.id.trim()
          : false;

      if (id) {
        // Lookup check
        dataLib.read('checks', id, (err, checkData) => {
          if (!err && checkData) {
            // * Only let authenticated users delete their own obj, not anyone elses
            // Get token from headers client sent
            const token =
              typeof data.headers.token === 'string' &&
              data.headers.token.trim().length === 20
                ? data.headers.token.trim()
                : false;
            // Verify token is active and valid for the user
            handlers._tokens.verifyToken(
              token,
              checkData.userPhone,
              tokenIsValid => {
                if (tokenIsValid) {
                  // Delete check
                  dataLib.delete('checks', id, err => {
                    if (!err) {
                      dataLib.read(
                        'users',
                        checkData.userPhone,
                        (err, userData) => {
                          if (!err && userData) {
                            const userChecks =
                              typeof userData.checks === 'object' &&
                              userData.checks instanceof Array
                                ? userData.checks
                                : [];
                            // Remove deleted check from userChecks array
                            const checkIndex = userChecks.indexOf(id);
                            if (checkIndex > -1) {
                              userChecks.splice(checkIndex, 1);
                              // Update user data
                              dataLib.update(
                                'users',
                                checkData.userPhone,
                                userData,
                                err => {
                                  if (!err) {
                                    callback(200);
                                  } else {
                                    callback(500, {
                                      error: 'Could not update the user',
                                    });
                                  }
                                }
                              );
                            } else {
                              callback(500, {
                                error: 'Could not find check in user data',
                              });
                            }
                          } else {
                            callback(500, {
                              error:
                                'Could not find the user who created the check to remove check from user data',
                            });
                          }
                        }
                      );
                    } else {
                      callback(500, { error: 'Unable to delete check data' });
                    }
                  });
                  // Lookup user
                } else {
                  callback(403, { error: 'Token missing or invalid' });
                }
              }
            );
          } else {
            callback(400, { error: 'Check ID does not exist' });
          }
        });
      } else {
        callback(400, { error: 'Missing required field' });
      }
    },
  },
};

module.exports = handlers;
