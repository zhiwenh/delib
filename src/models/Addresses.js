'use strict';
/**
 * Model for setting deployed contract addresses in a plain text file and getting those addresses.
 */
const path = require('path');
const pathExists = require('path-exists').sync;
const fs = require('fs-extra');
const prepend = require('prepend-file').sync;
const config = require('./../config/config.js');

const RELATIVE_PATH = path.relative(__dirname, config.projectRoot);

// The amount of addresses per file
const ADDRESSES_AMOUNT = 50;

const ENDING = 'Address';

module.exports = {
  set: (name, address) => {
    const pathway = path.join(__dirname, RELATIVE_PATH, config.contracts.address);
    if (!pathExists(path.join(pathway))) {
      fs.mkdirSync(path.join(pathway));
    }

    address += '\n';
    name = name + ENDING;
    prepend(path.join(pathway, name), address);
    let addressesFile = fs.readFileSync(path.join(pathway, name), 'utf8');
    const addresses = addressesFile.split('\n');
    if (addresses.length > ADDRESSES_AMOUNT) {
      addresses.pop();
      addressesFile = addresses.join('\n');
      fs.writeFileSync(path.join(pathway, name), addressesFile);
    }
  },
  get: (name, index) => {
    const pathway = path.join(__dirname, RELATIVE_PATH, config.contracts.address);
    index = index || 0;
    name = name + ENDING;
    const addressesFile = fs.readFileSync(path.join(pathway, name), 'utf8');
    const addresses = addressesFile.split('\n');
    const address = addresses[index];
    return address.trim();
  },
  getAll: (name) => {
    const pathway = path.join(__dirname, RELATIVE_PATH, config.contracts.address);
    name = name + ENDING;
    const addressesFile = fs.readFileSync(path.join(pathway, name), 'utf8');
    return addressesFile.split('\n');
  }
};
