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

/**
* @param {string} password
* @param {Web3} web3IPC
* @returns {Promise} - Response of promise is the account address
**/
module.exports = promisify((password, web3IPC, callback) => {
  if (!web3IPC) web3IPC = Web3IPC.create(options);
  return web3IPC.personal.newAccount(password, (err, res) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, res);
    }
  });
});
