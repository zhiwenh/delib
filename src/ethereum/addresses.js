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
const ENDING = 'Addresses.json';

function Addresses() {
  this.path = config.paths.address; // To set the path to the addresses folder

  /**
   * Saves a contract address in a file
   * @param {string} contractName
   * @param {string} contractAddress
   * @param {Object} links - An object with keys as library name and value as address
   * @returns {number} - Amount of addresses saved
   */
  this.set = (contractName, contractAddress, links) => {
    if (typeof contractAddress !== 'string' || contractAddress.length !== 42) {
      throw new Error('Invalid contract address: ' + contractAddress);
    }

    const pathway = path.join(__dirname, RELATIVE_PATH, this.path);

    // Make addresses folder if it doesn't exist
    if (!pathExists(path.join(pathway))) {
      fs.mkdirSync(path.join(pathway));
    }

    const fileName = contractName + ENDING;
    const filePath = path.join(pathway, fileName);

    let fileJSON;
    try {
      const fileString = fs.readFileSync(filePath, 'utf8');
      fileJSON = JSON.parse(fileString);
    } catch (e) {
      fileJSON = [];
    }

    function isEmpty(obj) {
      for (let key in obj) { return false; }
      return true;
    }

    fileJSON.push({
      address: contractAddress,
      links: links
    });

    fs.writeFileSync(filePath, JSON.stringify(fileJSON, null, 2));
    return fileJSON.length;
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
    const fileString = fs.readFileSync(filePath, 'utf8');
    let fileArray = JSON.parse(fileString);

    if (!Array.isArray(fileArray)) {
      fileArray = [fileArray];
    }

    index = index || fileArray.length - 1;

    // Make sure you get an address with a length of 42

    const address = fileArray[index];

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
    const fileString = fs.readFileSync(filePath, 'utf8');
    let fileArray = JSON.parse(fileString);

    if (!Array.isArray(fileArray)) {
      fileArray = [fileArray];
    }

    return fileArray;
  };

  this._checkPathError = (contractName, pathway) => {
    if (!pathExists(pathway)) {
      throw new Error(contractName + ' addresses file does not exist');
    }
  };

}

module.exports = new Addresses();
