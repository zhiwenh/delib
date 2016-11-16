const Web3IPC = require('web3_ipc');
const promisify = require('es6-promisify');
const config = require('./../config/config.js');

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
    web3IPC = Web3IPC.create(options);
  } catch (e) {
    web3IPC = undefined;
  }
  return web3IPC;
};
