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
*
* @param {string} index
* @param {string} password
* @param {number} timeLength
* @param {Web3} web3IPC
* @returns {Bool} - promise with a response of success or fail
**/
module.exports = promisify((index, password, timeLength, web3IPC, callback) => {
  if (!web3IPC) web3IPC = Web3IPC.create(options);
  promisify(web3IPC.eth.getAccounts)()
    .then(accounts => {
      if (index < 0 || index >= accounts.length) {
        throw new Error('Invalid account index');
      }
      return promisify(web3IPC.personal.unlockAccount)(accounts[index], password, timeLength);
    })
    .then(address => {
      callback(null, address);
    })
    .catch(err => {
      callback(err, null);
    });
});
