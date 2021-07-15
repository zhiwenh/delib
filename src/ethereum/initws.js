'use strict';

const Web3 = require('web3');
const config = require('./../config/config.js');

module.exports = function(wsPath) {
  wsPath = wsPath || config.ws.wsPath;
  const web3 = new Web3(new Web3.providers.WebsocketProvider(wsPath));
  // return web3.isConnected() ? web3 : undefined;
  return web3;
};
