'use strict';
/**
 * Model for setting deployed contract addresses in a plain text file and getting those addresses.
 */
const path = require('path');
const fs = require('fs');

const config = require('./../config/config.js');

const RELATIVE_PATH = path.relative(__dirname, config.projectRoot);
const pathway = path.join(__dirname, RELATIVE_PATH, config.contracts.address);

const ENDING = 'Address';

module.exports = {
  set: (name ,address) => {
    name = name + ENDING;
    fs.writeFileSync(path.join(pathway, name), address);
  },
  get: (name) => {
    name = name + ENDING;
    const address = fs.readFileSync(path.join(pathway, name), 'utf8');
    return address.trim();
  }
};
