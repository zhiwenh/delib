'use strict';

const Web3 = require('web3');
const config = require('./../config/config.js');

module.exports = function(rpcPath) {
  rpcPath = rpcPath || config.rpc.rpcPath;
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcPath));
  // return web3.isConnected() ? web3 : undefined;
  return web3;
};
