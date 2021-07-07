const Web3IPC = require('web3_ipc');
const web3 = require('web3');
const promisify = require('es6-promisify');
const config = require('./../config/config.js');
const net = require('net');
const options = {
  host: null,
  ipc: true,
  personal: true,
  admin: true,
  debug: false
};

module.exports = (ipcPath) => {
  options.host = ipcPath || config.ipc.host;
  let web3IPC;
  try {
    var web3 = new Web3(options.host, net); // mac os path
  } catch (e) {
    web3IPC = undefined;
  }
  return web3;
};
