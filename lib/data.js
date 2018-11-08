/**
 * Library for storing and editing data
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Container for module (to be exported)
const lib = {
  // Base directory of the data folder
  baseDir: path.join(__dirname, '/../.data/'),

  // Write data to a file
  create(dir, fileName, data, callback) {
    // Open file for writing - wx will error out if file exists
    fs.open(
      `${lib.baseDir}${dir}/${fileName}.json`,
      'wx',
      (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
          // Convert data to string
          const stringData = JSON.stringify(data);
          fs.writeFile(fileDescriptor, stringData, err => {
            if (!err) {
              fs.close(fileDescriptor, err => {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing new file');
                }
              });
            } else {
              callback('Error writing to new file');
            }
          });
        } else {
          callback('Could not create new file, it may already exist');
        }
      }
    );
  },

  // Read data from a file
  read(dir, fileName, callback) {
    fs.readFile(
      `${lib.baseDir}${dir}/${fileName}.json`,
      'utf8',
      (err, data) => {
        if (!err && data) {
          // Use helper parse to convert stored json into obj
          const parsedData = helpers.parseJson(data);
          callback(false, parsedData);
        } else {
          callback(err, data);
        }
      }
    );
  },

  // Update data inside existing file
  update(dir, fileName, data, callback) {
    // Open file for writing - r+ will error out if file doesnt exist
    fs.open(
      `${lib.baseDir}${dir}/${fileName}.json`,
      'r+',
      (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
          // Convert data to string
          const stringData = JSON.stringify(data);

          // Truncate file contents
          fs.ftruncate(fileDescriptor, err => {
            if (!err) {
              // Write to file and close it
              fs.writeFile(fileDescriptor, stringData, err => {
                if (!err) {
                  fs.close(fileDescriptor, err => {
                    if (!err) {
                      callback(false);
                    } else {
                      callback('Error closing existing file');
                    }
                  });
                } else {
                  callback('Error writing to existing file');
                }
              });
            } else {
              callback('Error truncating file');
            }
          });
        } else {
          callback(
            'Could not open the file for updating, it may not exist yet'
          );
        }
      }
    );
  },

  // Delete a file
  delete(dir, fileName, callback) {
    // Unlink file
    fs.unlink(`${lib.baseDir}${dir}/${fileName}.json`, err => {
      if (!err) {
        callback(false);
      } else {
        callback('Error deleting file');
      }
    });
  },

  // List all items in given directory
  list(dir, callback) {
    fs.readdir(`${lib.baseDir}${dir}/`, (err, data) => {
      if (!err && data && data.length > 0) {
        const trimmedFileNames = [];
        data.forEach(fileName => {
          // Remove .json extension and only push filenames
          trimmedFileNames.push(fileName.replace('.json', ''));
        });
        callback(false, trimmedFileNames);
      } else {
        callback(err, data);
      }
    });
  },
};

// Export module
module.exports = lib;
