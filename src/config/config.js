'use strict';
const path = require('path');
const fs = require('fs');
const defaultConfig = require('./default');

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
    const configContents = defaultConfig;
    process.chdir(originalDirectory);
    configContents.projectRoot = originalDirectory;
    return configContents;
  }

  levels--;
  return findConfig(originalDirectory, levels);
}

const originalDirectory = process.cwd();
const config = findConfig(originalDirectory, 10);

/** Makes sure all the config options are there */
if (typeof config.paths !== 'object' || Array.isArray(config.paths)) {
  config.paths = defaultConfig.paths;
}
config.paths.contract = config.paths.contract || defaultConfig.paths.contract;
config.paths.built = config.paths.built || defaultConfig.paths.built;
config.paths.address = config.paths.address || defaultConfig.paths.address;

if (typeof config.ipc !== 'object' || Array.isArray(config.ipc)) {
  config.ipc = defaultConfig.ipc;
}
config.ipc.host = config.ipc.host || defaultConfig.ipc.host;

if (typeof config.rpc !== 'object' || Array.isArray(config.rpc)) {
  config.rpc = defaultConfig.rpc;
}
config.rpc.host = config.rpc.host || defaultConfig.rpc.host;
config.rpc.port = config.rpc.port || defaultConfig.rpc.port;

if (typeof config.cli !== 'object' || Array.isArray(config.cli)) {
  config.cli = defaultConfig.cli;
}
if (typeof config.cli.options !== 'object' || Array.isArray(config.cli.options)) {
  config.cli.options = defaultConfig.cli.options;
}
config.cli.options.from = config.cli.options.from || defaultConfig.cli.options.from;
config.cli.options.value = config.cli.options.value || defaultConfig.cli.options.value;
config.cli.options.gas = config.cli.options.gas || defaultConfig.cli.options.gas;

/***********/

// To create the ipc host relative path
config.ipc.host = config.ipc.host ? path.join(config.projectRoot, config.ipc.host) : config.ipc.host;

module.exports = config;
