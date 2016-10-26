'use strict';
/**
 * Model for setting deployed contract addresses in a plain text file and getting those addresses.
 */
const path = require('path');
const fs = require('fs-extra');
const prepend = require('prepend-file').sync;
const config = require('./../config/config.js');

const RELATIVE_PATH = path.relative(__dirname, config.projectRoot);
const pathway = path.join(__dirname, RELATIVE_PATH, config.contracts.address);

// The amount of addresses per file
const ADDRESSES_AMOUNT = 50;

const ENDING = 'Address';

module.exports = {
  set: (name, address) => {
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
    index = index || 0;
    name = name + ENDING;
    const addressesFile = fs.readFileSync(path.join(pathway, name), 'utf8');
    const addresses = addressesFile.split('\n');
    const address = addresses[index];
    return address.trim();
  }
};
