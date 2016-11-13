'use strict';
const path = require('path');
const fs = require('fs');

/**
 * Recursively calls up directories from this file to find delib.js configuration file. If it doesn't find one it gets the default config file.
 *@param {string} originalDirectory - The original directory. Pass in process.cwd()
 *@param {number} levels - The number of folders to go up
 *@return {Object} The configuration object.
 */

function findConfig(originalDirectory, levels) {
  const directoryPath = process.cwd();
  const files = fs.readdirSync(directoryPath);
  for (let i = 0; i < files.length; i++) {
    if (files[i] === 'delib.js') {
      const relativePath = path.relative(__dirname, directoryPath);
      const configContents = require(path.join(relativePath, 'delib.js'));
      process.chdir(originalDirectory);
      configContents.projectRoot = directoryPath;
      return configContents;
    }
  }

  // To break if it reaches the computer root.
  try {
    process.chdir('../');
  } catch(e) {
    levels = 1;
  }

  // Requires the default config file if delib.js can't be found
  if (levels === 1) {
    const configContents = require('./default.js');
    process.chdir(originalDirectory);
    configContents.projectRoot = originalDirectory;
    return configContents;
  }

  levels--;
  return findConfig(originalDirectory, levels);
}

const originalDirectory = process.cwd();
const config = findConfig(originalDirectory, 10);

// To create the ipc host relative path
config.ipc.host = config.ipc.host ? path.join(config.projectRoot, config.ipc.host) : config.ipc.host;

module.exports = config;
