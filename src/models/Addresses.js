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

const ENDING = 'Addresses';

function Addresses() {
  this.path = config.paths.address; // To set the path to the addresses

  this.set = (name, address) => {
    if (typeof address !== 'string' || address.length !== 42) {
      throw new Error('Invalid contract address: ' + address);
    }
    const pathway = path.join(__dirname, RELATIVE_PATH, this.path);
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
    return addresses.length - 1;
  };

  this.get = (name, index) => {
    const pathway = path.join(__dirname, RELATIVE_PATH, this.path);
    index = index || 0;
    name = name + ENDING;
    const addressesFile = fs.readFileSync(path.join(pathway, name), 'utf8');
    const addresses = addressesFile.split('\n');
    let address;
    // Make sure you get an address with a length of 42
    for (let i = index; i < addresses.length; i++) {
      if (addresses[i].length === 42) {
        address = addresses[i].trim();
        break;
      }
    }

    return address;
  };

  this.getAll = (name) => {
    const pathway = path.join(__dirname, RELATIVE_PATH, this.path);
    name = name + ENDING;
    const addressesFile = fs.readFileSync(path.join(pathway, name), 'utf8');
    return addressesFile.split('\n').filter(address => {
      return address.length === 42;
    });
  };

}

module.exports = new Addresses();
