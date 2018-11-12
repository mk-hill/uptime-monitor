/**
 * Front end logic for App
 */

// Container for frontend app
const app = {
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
  // Config
  config: {
    sessionToken: false,
  },
};
