/**
 * Front end logic for App
 */

// Container for frontend app
const app = {
  // Config
  config: {
    sessionToken: false,
  },

  init() {
    // Bind all form submissions
    this.bindForms();
  },

  // AJAX Client for restful API
  client: {
    request(headers, path, method, queryStringObject, payload, callback) {
      // Validate, set defaults
      headers = typeof headers === 'object' && headers !== null ? headers : {};
      path = typeof path === 'string' ? path : '/';
      method = typeof method === 'string' && [
        'POST',
        'GET',
        'PUT',
        'DELETE'.includes(method),
      ]
        ? method.toUpperCase()
        : 'GET';
      queryStringObject =
        typeof queryStringObject === 'object' && queryStringObject !== null
          ? queryStringObject
          : {};
      payload = typeof payload === 'object' && payload !== null ? payload : {};
      // Defaulting to false to allow client use without callback
      callback = typeof callback === 'function' ? callback : false;

      // Add each query string param to path
      let requestUrl = path + '?';
      let counter = 0;
      for (let queryKey in queryStringObject) {
        if (queryStringObject.hasOwnProperty(queryKey)) {
          counter++;
          // Prepend params after first with ampersand
          if (counter > 1) {
            requestUrl += '&';
          }
          // Add key and value
          requestUrl += `${queryKey}=${queryStringObject[queryKey]}`;
        }
      }

      // Form the http request as a json type
      const xhr = new XMLHttpRequest();
      xhr.open(method, requestUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');

      // Add each sent header to request
      for (let headerKey in headers) {
        if (headers.hasOwnProperty(headerKey)) {
          xhr.setRequestHeader(headerKey, headers[headerKey]);
        }
      }

      // If there is a current session token, add as a header
      if (app.config.sessionToken) {
        xhr.setRequestHeader('token', app.config.sessionToken.id);
      }

      // Handle response when request comes back
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          const statusCode = xhr.status;
          const responseReturned = xhr.responseText;

          // Callback if requested
          if (callback) {
            try {
              const parsedResponse = JSON.parse(responseReturned);
              callback(statusCode, parsedResponse);
              // Catch any errors parse throws if response wasn't valid json
            } catch (e) {
              callback(statusCode, false);
            }
          }
        }
      };

      // Send payload as JSON
      const payloadString = JSON.stringify(payload);
      xhr.send(payloadString);
    },
  },

  // Bind the logout button
  bindLogoutButton() {
    document.getElementById('logoutButton').addEventListener('click', e => {
      // Prevent redirection
      e.preventDefault();

      // Log the user out
      app.logUserOut();
    });
  },

  // Log the user out and redirect them
  logUserOut(redirectUser) {
    // Set redirectUser to default to true
    redirectUser = typeof redirectUser == 'boolean' ? redirectUser : true;

    // Get the current token id
    const tokenId =
      typeof app.config.sessionToken.id == 'string'
        ? app.config.sessionToken.id
        : false;

    // Send the current token to the tokens endpoint to delete it
    const queryStringObject = {
      id: tokenId,
    };
    app.client.request(
      undefined,
      'api/tokens',
      'DELETE',
      queryStringObject,
      undefined,
      function(statusCode, responsePayload) {
        // Set the app.config token as false
        app.setSessionToken(false);

        // Send the user to the logged out page
        if (redirectUser) {
          window.location = '/session/deleted';
        }
      }
    );
  },

  // Bind the forms
  bindForms() {
    if (document.querySelector('form')) {
      const allForms = document.querySelectorAll('form');
      for (let i = 0; i < allForms.length; i++) {
        allForms[i].addEventListener('submit', function(e) {
          // Stop it from submitting
          e.preventDefault();
          const formId = this.id;
          const path = this.action;
          let method = this.method.toUpperCase();

          // Hide the error message (if it's currently shown due to a previous error)
          document.querySelector('#' + formId + ' .formError').style.display =
            'none';

          // Hide the success message (if it's currently shown due to a previous error)
          if (document.querySelector('#' + formId + ' .formSuccess')) {
            document.querySelector(
              '#' + formId + ' .formSuccess'
            ).style.display = 'none';
          }

          // Turn the inputs into a payload
          const payload = {};
          const elements = this.elements;
          for (let i = 0; i < elements.length; i++) {
            if (elements[i].type !== 'submit') {
              // Determine class of element and set value accordingly
              const classOfElement =
                typeof elements[i].classList.value === 'string' &&
                elements[i].classList.value.length > 0
                  ? elements[i].classList.value
                  : '';
              const valueOfElement =
                elements[i].type === 'checkbox' &&
                !classOfElement.includes('multiselect')
                  ? elements[i].checked
                  : !classOfElement.includes('intval')
                    ? elements[i].value
                    : parseInt(elements[i].value);
              const elementIsChecked = elements[i].checked;
              // Override the method of the form if the input's name is _method
              let nameOfElement = elements[i].name;
              if (nameOfElement === '_method') {
                method = valueOfElement;
              } else {
                // Create an payload field named "method" if the elements name is actually httpmethod
                if (nameOfElement === 'httpmethod') {
                  nameOfElement = 'method';
                }
                // Create an payload field named "id" if the elements name is actually uid
                if (nameOfElement === 'uid') {
                  nameOfElement = 'id';
                }
                // If the element has the class "multiselect" add its value(s) as array elements
                if (classOfElement.includes('multiselect')) {
                  if (elementIsChecked) {
                    payload[nameOfElement] =
                      typeof payload[nameOfElement] === 'object' &&
                      payload[nameOfElement] instanceof Array
                        ? payload[nameOfElement]
                        : [];
                    payload[nameOfElement].push(valueOfElement);
                  }
                } else {
                  payload[nameOfElement] = valueOfElement;
                }
              }
            }
          }

          // If the method is DELETE, the payload should be a queryStringObject instead
          const queryStringObject = method == 'DELETE' ? payload : {};

          // Call the API
          app.client.request(
            undefined,
            path,
            method,
            queryStringObject,
            payload,
            function(statusCode, responsePayload) {
              // Display an error on the form if needed
              if (statusCode !== 200) {
                if (statusCode == 403) {
                  // log the user out
                  app.logUserOut();
                } else {
                  // Try to get the error from the api, or set a default error message
                  const error =
                    typeof responsePayload.Error == 'string'
                      ? responsePayload.Error
                      : 'An error has occured, please try again';

                  // Set the formError field with the error text
                  document.querySelector(
                    '#' + formId + ' .formError'
                  ).innerHTML = error;

                  // Show (unhide) the form error field on the form
                  document.querySelector(
                    '#' + formId + ' .formError'
                  ).style.display = 'block';
                }
              } else {
                // If successful, send to form response processor
                app.formResponseProcessor(formId, payload, responsePayload);
              }
            }
          );
        });
      }
    }
  },

  // Form response processor
  formResponseProcessor(formId, requestPayload, responsePayload) {
    const functionToCall = false;
    // If account creation was successful, try to immediately log the user in
    if (formId == 'accountCreate') {
      // Take the phone and password, and use it to log the user in
      const newPayload = {
        phone: requestPayload.phone,
        password: requestPayload.password,
      };

      app.client.request(
        undefined,
        'api/tokens',
        'POST',
        undefined,
        newPayload,
        function(newStatusCode, newResponsePayload) {
          // Display an error on the form if needed
          if (newStatusCode !== 200) {
            // Set the formError field with the error text
            document.querySelector('#' + formId + ' .formError').innerHTML =
              'Sorry, an error has occured. Please try again.';

            // Show (unhide) the form error field on the form
            document.querySelector('#' + formId + ' .formError').style.display =
              'block';
          } else {
            // If successful, set the token and redirect the user
            app.setSessionToken(newResponsePayload);
            window.location = '/checks/all';
          }
        }
      );
    }
    // If login was successful, set the token in localstorage and redirect the user
    if (formId == 'sessionCreate') {
      app.setSessionToken(responsePayload);
      window.location = '/checks/all';
    }

    // If forms saved successfully and they have success messages, show them
    const formsWithSuccessMessages = [
      'accountEdit1',
      'accountEdit2',
      'checksEdit1',
    ];
    if (formsWithSuccessMessages.indexOf(formId) > -1) {
      document.querySelector('#' + formId + ' .formSuccess').style.display =
        'block';
    }

    // If the user just deleted their account, redirect them to the account-delete page
    if (formId == 'accountEdit3') {
      app.logUserOut(false);
      window.location = '/account/deleted';
    }

    // If the user just created a new check successfully, redirect back to the dashboard
    if (formId == 'checksCreate') {
      window.location = '/checks/all';
    }

    // If the user just deleted a check, redirect them to the dashboard
    if (formId == 'checksEdit2') {
      window.location = '/checks/all';
    }
  },

  // Get the session token from localstorage and set it in the app.config object
  getSessionToken() {
    const tokenString = localStorage.getItem('token');
    if (typeof tokenString === 'string') {
      try {
        const token = JSON.parse(tokenString);
        app.config.sessionToken = token;
        if (typeof token === 'object') {
          app.setLoggedInClass(true);
        } else {
          app.setLoggedInClass(false);
        }
      } catch (e) {
        app.config.sessionToken = false;
        app.setLoggedInClass(false);
      }
    }
  },

  // Set (or remove) the loggedIn class from the body
  setLoggedInClass(add) {
    const target = document.querySelector('body');
    if (add) {
      target.classList.add('loggedIn');
    } else {
      target.classList.remove('loggedIn');
    }
  },

  // Set the session token in the app.config object as well as localstorage
  setSessionToken(token) {
    app.config.sessionToken = token;
    const tokenString = JSON.stringify(token);
    localStorage.setItem('token', tokenString);
    if (typeof token === 'object') {
      app.setLoggedInClass(true);
    } else {
      app.setLoggedInClass(false);
    }
  },

  // Renew the token
  renewToken(callback) {
    const currentToken =
      typeof app.config.sessionToken === 'object'
        ? app.config.sessionToken
        : false;
    if (currentToken) {
      // Update the token with a new expiration
      const payload = {
        id: currentToken.id,
        extend: true,
      };
      app.client.request(
        undefined,
        'api/tokens',
        'PUT',
        undefined,
        payload,
        function(statusCode, responsePayload) {
          // Display an error on the form if needed
          if (statusCode === 200) {
            // Get the new token details
            const queryStringObject = { id: currentToken.id };
            app.client.request(
              undefined,
              'api/tokens',
              'GET',
              queryStringObject,
              undefined,
              function(statusCode, responsePayload) {
                // Display an error on the form if needed
                if (statusCode === 200) {
                  app.setSessionToken(responsePayload);
                  callback(false);
                } else {
                  app.setSessionToken(false);
                  callback(true);
                }
              }
            );
          } else {
            app.setSessionToken(false);
            callback(true);
          }
        }
      );
    } else {
      app.setSessionToken(false);
      callback(true);
    }
  },

  // Loop to renew token every minute
  tokenRenewalLoop() {
    setInterval(function() {
      app.renewToken(function(err) {
        if (!err) {
          console.log('Token renewed successfully @ ' + Date.now());
        }
      });
    }, 1000 * 60);
  },
};

window.onload = () => {
  app.init();
};
