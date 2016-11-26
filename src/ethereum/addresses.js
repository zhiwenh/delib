'use strict';
/**
 * Model for setting deployed contract addresses in a plain text file and getting those addresses.
 */
const path = require('path');
const pathExists = require('path-exists').sync;
const fs = require('fs-extra');
const config = require('./../config/config.js');

const RELATIVE_PATH = path.relative(__dirname, config.projectRoot);

// Ending of the addresses files
const ENDING = 'Addresses';

function Addresses() {
  this.path = config.paths.address; // To set the path to the addresses folder

  /**
   * Saves a contract address in a file
   * @param {string} contractName
   * @param {string} contractAddress
   * @returns {number} - Amount of addresses saved
   */
  this.set = (contractName, contractAddress) => {
    if (typeof contractAddress !== 'string' || contractAddress.length !== 42) {
      throw new Error('Invalid contract address: ' + contractAddress);
    }
    const pathway = path.join(__dirname, RELATIVE_PATH, this.path);

    // Make addresses folder if it doesn't exist
    if (!pathExists(path.join(pathway))) {
      fs.mkdirSync(path.join(pathway));
    }
    contractAddress += '\n';
    const fileName = contractName + ENDING;
    const filePath = path.join(pathway, fileName);

    fs.appendFileSync(filePath, contractAddress);
    let addressesFile = fs.readFileSync(filePath, 'utf8');
    const addresses = addressesFile.split('\n');
    return addresses.length;
  };

  /**
   * Gets the most recent contract address or at the index if its given
   * @param {string} contractName
   * @param {number} index
   * @returns {string}
   */
  this.get = (contractName, index) => {
    const fileName = contractName + ENDING;
    const filePath = path.join(__dirname, RELATIVE_PATH, this.path, fileName);
    this._checkPathError(contractName, filePath);
    const addressesFile = fs.readFileSync(filePath, 'utf8');
    const addresses = addressesFile.split('\n');

    index = index || addresses.length - 1;

    // Make sure you get an address with a length of 42
    let address;
    for (let i = index; i >= 0; i--) {
      if (addresses[i].length === 42) {
        address = addresses[i].trim();
        break;
      }
    }

    if (!address) {
      throw new Error('Could not get a valid address from ' + contractName);
    }

    return address;
  };

  /**
   * Gets all addresses saved
   * @param {string} contractName
   * @returns {Array}
   */
  this.getAll = (contractName) => {
    const fileName = contractName + ENDING;
    const filePath = path.join(__dirname, RELATIVE_PATH, this.path, fileName);
    this._checkPathError(contractName, filePath);
    const addressesFile = fs.readFileSync(filePath, 'utf8');
    return addressesFile.split('\n').filter(address => {
      return address.length === 42;
    });
  };

  this._checkPathError = (contractName, pathway) => {
    if (!pathExists(pathway)) {
      throw new Error(contractName + ' addresses file does not exist');
    }
  };
}

module.exports = new Addresses();
