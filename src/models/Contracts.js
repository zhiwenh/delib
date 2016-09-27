'use strict';
/**
 * Model for setting deployed contract addresses in a plain text file and getting those addresses.
 */
const path = require('path');
const fs = require('fs');

const config = require('./../config/config.js');

const RELATIVE_PATH = path.relative(__dirname, config.projectRoot);
const PATH_WAY = path.join(__dirname, RELATIVE_PATH, config.contracts.address);

module.exports = {
  set: (name ,address) => {
    fs.writeFileSync(path.join(PATH_WAY, name), address);
  },
  get: (name) => {
    const address = fs.readFileSync(path.join(PATH_WAY, name), 'utf8');
    return address.trim();
  }
};
