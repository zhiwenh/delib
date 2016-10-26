'use strict';

const Web3 = require('web3');
const config = require('./../config/config.js');

module.exports = function(rpcHost, rpcPort) {
  let web3;
  if (rpcPort && rpcHost) {
    const rpcProvider = new Web3.providers.HttpProvider('http://' + rpcHost + ':' + rpcPort);
    web3 = new Web3(rpcProvider);
  } else if (rpcHost) {
    const rpcProvider = new Web3.providers.HttpProvider('http://' + rpcHost + ':' + config.rpc.port);
    web3 = new Web3(rpcProvider);
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider('http://' + config.rpc.host + ':' + config.rpc.port));
  }
  return web3.isConnected() ? web3 : undefined;
};
