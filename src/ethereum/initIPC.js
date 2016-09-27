const Web3IPC = require('web3_ipc');
const promisify = require('es6-promisify');
const config = require('./../config/config.js');

const options = {
  host: config.ipc.host,
  ipc: true,
  personal: true,
  admin: true,
  debug: false
};

module.exports = (ipcPath) => {
  let web3IPC;
  if (ipcPath) {
    options.host = ipcPath;
    const web3IPC = Web3IPC.create(options);
  } else {
    const web3IPC = Web3IPC.create(options);
  }
  return web3IPC;
};
