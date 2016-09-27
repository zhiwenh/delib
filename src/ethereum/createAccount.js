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
* @password {String} - password for account
* @returns {String} - promise with a response thats the account number
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
