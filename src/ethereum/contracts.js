'use strict';
const addresses = require('./addresses');
const config = require('./../config/config');

/**
 * Contains the contract related properties and methods
 */
function Contracts() {
  /** Paths to contract related folders */
  this.paths = {
    contract: config.paths.contract,
    built: config.paths.built,
    address: config.paths.address
  };

  /** Contains address model methods */
  this.addresses = {};

  /**
   * Set an address for a contract to use for future transactions.
   * @param {string} name
   * @param {string} address
   * @returns {string} - The index of the address saved
   */
  this.addresses.set = (name, address, links) => {
    addresses.path = this.paths.address;
    return addresses.set(name, address, links);
  };

  /**
   * Get a deployed contract address based on index.
   * @param {string} name
   * @param {number} index
   * @returns {string}
   */
  this.addresses.get = (name, index) => {
    addresses.path = this.paths.address;
    return addresses.get(name, index);
  };

  /**
   * Get the links of a deployed contract
   * @param {string} name
   * @param {number} index
   * @returns {Object}
   */
  this.addresses.getLinks = (name, index) => {
    addresses.path = this.paths.address;
    return addresses.getLinks(name, index);
  };

  /**
   * Get all the deployed addresses of a contract
   * @param {string} name
   * @returns {Array} - Arr
   */
  this.addresses.getAll = (name) => {
    addresses.path = this.paths.address;
    return addresses.getAll(name);
  };

  /**
   * Get all the deployed address links of a contract
   * @param {string} name
   * @returns {Array} - Array of objects containing the contract address and link addresses
   */
  this.addresses.getAllLinks = (name) => {
    addresses.path = this.paths.address;
    return addresses.getAllLinks(name);
  };

}

const contracts = new Contracts();

module.exports = contracts;
