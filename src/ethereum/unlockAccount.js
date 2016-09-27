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
* NEED TO CALL PROCESS.EXIT() in callback
* @account {String} - account address
* @password {String} - password for account
* @returns {Bool} - promise with a response of success or fail
**/
module.exports = promisify((account, password, timeLength, web3IPC, callback) => {
  if (!web3IPC) web3IPC = Web3IPC.create(options);
  return web3IPC.personal.unlockAccount(account, password, timeLength, (err, res) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, res);
    }
  });
});
