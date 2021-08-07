const web3 = require('web3');
const promisify = require('es6-promisify');
const config = require('./../config/config.js');
const net = require('net');

module.exports = (ipcPath) => {
  options.host = ipcPath || config.ipc.host;
  let web3;
  try {
    web3 = new Web3(new Web3.providers.IpcProvider(ipcPath, net)); // mac os path
  } catch (e) {
    web3 = undefined;
  }
  return web3;
};
