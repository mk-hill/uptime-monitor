/**
 * Library for storing and rotating logs
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Container for the module
const lib = {
  baseDir: path.join(__dirname, '/../.logs/'),

  // Append a string to a file. Create file if it does not exist
  append(fileName, str, callback) {
    // Open the file for appending. a switch allows for creation if no file
    fs.open(`${lib.baseDir}${fileName}.log`, 'a', (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        // Append to file and close it
        fs.appendFile(fileDescriptor, str + '\n', err => {
          if (!err) {
            fs.close(fileDescriptor, err => {
              if (!err) {
                callback(false);
              } else {
                callback('Error closing file that was being appended');
              }
            });
          } else {
            callback('Error appending to file');
          }
        });
      } else {
        callback('Could not open file for appending');
      }
    });
  },

  // List all the logs and optionally include compressed files
  list(includeCompressedLogs, callback) {
    fs.readdir(lib.baseDir, (err, data) => {
      if (!err && data && data.length > 0) {
        const trimmedFileNames = [];
        data.forEach(fileName => {
          // Add the current (uncompressed) .log files
          if (fileName.includes('.log')) {
            trimmedFileNames.push(fileName.replace('.log', ''));
          }

          // Optionally add compressed .gz files
          if (includeCompressedLogs && fileName.includes('.gz.b64')) {
            trimmedFileNames.push(fileName.replace('.gz.b64', ''));
          }
        });
        callback(false, trimmedFileNames);
      } else {
        callback(err, data);
      }
    });
  },

  // Compress the contents of one .log file into a .gz.b64 file within the same dir
  compress(logId, newFileId, callback) {
    const sourceFile = `${logId}.log`;
    const destFile = `${newFileId}.gz.b64`;

    // Read source file
    fs.readFile(`${lib.baseDir}${sourceFile}`, 'utf8', (err, inputString) => {
      if (!err && inputString) {
        // Compress the data using gzip
        zlib.gzip(inputString, (err, buffer) => {
          if (!err && buffer) {
            // Send the compressed data to destination file
            fs.open(
              `${lib.baseDir}${destFile}`,
              'wx',
              (err, fileDescriptor) => {
                if (!err && fileDescriptor) {
                  // Write base64 encoded string to destination file
                  fs.writeFile(
                    fileDescriptor,
                    buffer.toString('base64'),
                    err => {
                      if (!err) {
                        // Close destination file
                        fs.close(fileDescriptor, err => {
                          if (!err) {
                            callback(false);
                          } else {
                            callback(err);
                          }
                        });
                      } else {
                        callback(err);
                      }
                    }
                  );
                } else {
                  callback(err);
                }
              }
            );
          } else {
            callback(err);
          }
        });
      } else {
        callback(err);
      }
    });
  },

  // Decompress the contents of a .gz.b64 file into a string variable
  decompress(fileId, callback) {
    const fileName = `${fileId}.gz.b64`;
    fs.readFile(`${lib.baseDir}${fileName}`, 'utf8', (err, str) => {
      if (!err && str) {
        const inputBuffer = Buffer.from(str, 'base64');
        zlib.unzip(inputBuffer, (err, outputBuffer) => {
          if (!err && outputBuffer) {
            // Callback string variable if successful
            const str = outputBuffer.toString();
            callback(false, str);
          } else {
            callback(err);
          }
        });
      } else {
        callback(err);
      }
    });
  },

  // Truncate a .log file
  truncate(logId, callback) {
    fs.truncate(`${lib.baseDir}${logId}.log`, 0, err => {
      if (!err) {
        callback(false);
      } else {
        callback(err);
      }
    });
  },
};

// Export the module
module.exports = lib;
