'use strict';

const Web3 = require('web3');
const config = require('./../config/config.js');

module.exports = function(rpcHost, rpcPort) {
  rpcHost = rpcHost || config.rpc.host;
  rpcPort = rpcPort || config.rpc.port;
  const web3 = new Web3(new Web3.providers.HttpProvider('http://' + rpcHost  + ':' + rpcPort));
  return web3.isConnected() ? web3 : undefined;
};
