const Web3 = require('web3');
const promisify = require('es6-promisify');
const config = require('./../config/config.js');
const net = require('net');

module.exports = (ipcPath) => {
  ipcPath = ipcPath || config.ipc.host;
  const web3 = new Web3(ipcPath, net);
  return web3;
};
