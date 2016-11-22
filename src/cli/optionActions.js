'use strict';
const eth = require('./../ethereum/ethereum');
const config = require('./../config/config');

module.exports = function(rawOptions) {
  rawOptions = Object.assign({}, config.cli.options, rawOptions);

  const options = {};
  
  /** Transaction option adjustments */
  eth.account = options.account || eth.account;
  if (rawOptions.from) options.from = rawOptions.from;
  if (rawOptions.to) options.to = rawOptions.to;
  if (rawOptions.value) options.value = Number(eth.web3.toWei(rawOptions.value, 'ether').toString());
  if (rawOptions.gas) options.gas = rawOptions.gas;
  if (rawOptions.gasprice) options.gasPrice = rawOptions.gasprice;
  if (rawOptions.data) options.data = rawOptions.data;
  if (rawOptions.nonce) options.nonce = rawOptions.nonce;

  /** Path adjustments */
  const ethPaths = eth.contracts.paths;
  ethPaths.contract = options.contract || ethPaths.contract;
  ethPaths.built = options.built || ethPaths.built;
  ethPaths.address = options.address || ethPaths.address;

  console.log('optionActions', options);
  return options;
};
