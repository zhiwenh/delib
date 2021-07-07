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

    console.log('fileJSON', fileJSON);
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
    let address;
    for (let i = index; i >= 0; i--) {
      if (Array.isArray(fileArray[i])) {
        continue;
      } else if (typeof fileArray[i] === 'object') {
        if (!fileArray[i].hasOwnProperty(contractName)) continue;
        if (fileArray[i][contractName].length === 42) {
          address = fileArray[i][contractName];
          break;
        }
      } else {
        if (fileArray[i].length === 42) {
          address = fileArray[i];
          break;
        }
      }
    }

    if (!address) {
      throw new Error('Could not get a valid address from ' + contractName);
    }

    return address;
  };

  this.getLinks = (contractName, index) => {
    const fileName = contractName + ENDING;
    const filePath = path.join(__dirname, RELATIVE_PATH, this.path, fileName);
    this._checkPathError(contractName, filePath);
    const fileString = fs.readFileSync(filePath, 'utf8');
    let fileArray = JSON.parse(fileString);

    if (!Array.isArray(fileArray)) {
      fileArray = [fileArray];
    }

    index = index || fileArray.length - 1;

    let links;
    let address;
    for (let i = index; i >= 0; i--) {
      if (Array.isArray(fileArray[i])) {
        continue;
      } else if (typeof fileArray[i] === 'object') {
        if (!fileArray[i].hasOwnProperty(contractName)) continue;
        if (fileArray[i][contractName].length === 42) {
          address = fileArray[i][contractName];
          delete fileArray[i][contractName];
          links = fileArray[i];
          break;
        }
      } else {
        if (fileArray[i].length === 42) {
          address = fileArray[i];
          links = {};
          break;
        }
      }
    }

    if (!address) {
      throw new Error('Could not get a valid address for links from ' + contractName);
    }

    return links;
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

    const addressesArray = [];

    for (let i = 0; i < fileArray.length; i++) {
      if (typeof fileArray[i] === 'object' && !Array.isArray(fileArray[i])) {
        if (!fileArray[i].hasOwnProperty(contractName)) continue;
        if (fileArray[i][contractName].length === 42) {
          addressesArray.push(fileArray[i][contractName]);
        }
      } else if (typeof fileArray[i] === 'string') {
        if (fileArray[i].length === 42) {
          addressesArray.push(fileArray[i]);
        }
      }
    }

    return addressesArray;
  };

  /**
   * Gets all links of addresses
   * @param {string} contractName
   * @returns {Array}
   */
  this.getAllLinks = (contractName) => {
    const fileName = contractName + ENDING;
    const filePath = path.join(__dirname, RELATIVE_PATH, this.path, fileName);
    this._checkPathError(contractName, filePath);
    const fileString = fs.readFileSync(filePath, 'utf8');
    let fileArray = JSON.parse(fileString);

    if (!Array.isArray(fileArray)) {
      fileArray = [fileArray];
    }

    const linksArray = [];

    for (let i = 0; i < fileArray.length; i++) {
      if (typeof fileArray[i] === 'object' && !Array.isArray(fileArray[i])) {
        if (!fileArray[i].hasOwnProperty(contractName)) continue;
        if (fileArray[i][contractName].length === 42) {
          linksArray.push(fileArray[i]);
        }
      } else if (typeof fileArray[i] === 'string') {
        if (fileArray[i].length === 42) {
          const linkObj = {};
          linkObj[contractName] = fileArray[i];
          linksArray.push(linkObj);
        }
      }
    }

    return linksArray;
  };

  this._checkPathError = (contractName, pathway) => {
    if (!pathExists(pathway)) {
      throw new Error(contractName + ' addresses file does not exist');
    }
  };

}

module.exports = new Addresses();
