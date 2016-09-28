'use strict';
const promisify = require('es6-promisify');
const path = require('path');
const fs = require('fs');
const prequire = require('parent-require');

const init = require('./init.js');
const initIPC = require('./initIPC.js');
const createAccount = require('./createAccount');
const unlockAccount = require('./unlockAccount');
const buildContracts = require('./buildContracts');

// Model
const Contracts = require('./../models/Contracts.js');

const config = require('./../config/config.js');

const RELATIVE_PATH = path.relative(__dirname, config.projectRoot); // allows building and requiring built contracts to the correct directory paths

class Ethereum {
  /**
   * Create an Ethereum object. Will need to use Ethereum.init() to connect to the Web3 RPC provider and use the Ethereun object methods
   */
  constructor() {
    this._init = false;
    this._web3IPC = null;
    this._provider= null; // RPC connection to Ethereum Geth node

    this.account = null;
    this.accounts = [];

    this.options = {
      from: this.account,
      value: 0,
      gas: 3000000
    };

    // paths to the contracts, built, and addresses
    this.contractOptions = {
      path: null,
      built: null,
      address: null
    };
  }

  /**
   * @param {string} contractName Name of contract in the directory path provided in Ethereum.contract.build
   * @returns {Contract} The built contract
   */
  _getBuiltContract(contractName) {
    this.init();
    let contract;
    let contractPath;
    if (this.contractOptions.path)
      contractPath = path.join(RELATIVE_PATH, this.contractOptions.path, contractName + '.sol.js');
    else
      contractPath = path.join(RELATIVE_PATH, config.contracts.built, contractName + '.sol.js');
    console.log(contractPath);
    try {
      contract = require(contractPath);
    } catch (e) {
      throw new Error('Built contract "' + contractName + '" could not be found');
    }
    return contract;
  }

  /**
   * Builds Solidity contracts.
   * @param {array} contractFiles Array of contract file names in the directory path provided in Ethereum.config.contracts
   * @param {string} contractPath Optional. Directory path where contract files are located. If none is given the directory path will be retrieved from config.path.
   * @param {string} buildPath Optional. Directory path where built contracts will be put. If none is given the directory path will be retrieved from config.built.
   */
  buildContracts(contractFiles, contractPath, buildPath) {
    this.init();
    if (!contractPath) {
      if (this.contractOptions.path)
        contractPath = path.join(__dirname, RELATIVE_PATH, this.contractOptions.path);
      else
        contractPath = path.join(__dirname, RELATIVE_PATH, config.contracts.path);
    }
    if (!buildPath) {
      if (this.contractOptions.built)
        buildPath = path.join(__dirname, RELATIVE_PATH, this.contractOptions.built);
      else
        buildPath = path.join(__dirname, RELATIVE_PATH, config.contracts.built);
    }
    return buildContracts(contractFiles, contractPath, buildPath);

  }

  /**
   * Initializes a RPC connection with a local Ethereum node. The RPC provider is set in Ethereum.config.rpc.port. Need to call before using the Ethereum object. If RPC connection is already initalized and valid the RPC connection will be set to the current provider.
   * @param {string} rpcHost - The host URL path to the RPC connection. Optional. If not given the rpcHost path will be taken from Ethereum.config.rpc.host.
   * @param {number} rpcPort - The port number to the RPC connection. Optional. If not given the rpcPort path will be taken from Ethereum.config.rpc.port.
   * @param {Object} contractOptions - Options to set up the contract paths. Takes in path, built, and address properties.
   * @returns {Web3} The Web3 object Ethereum uses set up to the RPC provider
   */
  init(rpcHost, rpcPort, contractOptions) {
    console.log(this._init);
    if (this._init === false) {
      this._web3 = init(rpcHost, rpcPort);
      this._init = true;
      if (this.check() === false) {
        throw new Error('Not connected to RPC');
        // this._init = false;
      } else {
        this.accounts = this._web3.eth.accounts;
        // rebinding this doesn't work
        this._web3.eth.defaultAccount = this._web3.eth.accounts[0];
        this.account = this.accounts[0];
        this._provider = this._web3.currentProvider;
        this.contractOptions = contractOptions || this.contractOptions;
      }
    }
    this.options.from = this.account;
    return this._web3;
  }

  /**
   * Initializes an IPC connection with a local Ethereum node. The IPC provider is set in Ethereum.config.ipc.host. Need to call before using the Ethereum object IPC methods.
   * @param {string} ipcPath Path to the IPC provider. Example for Unix: process.env.HOME + '/Library/Ethereum/geth.ipc'
   * @returns {Web3} The Web3 object Ethereum uses for its IPC connection.
   */
  initIPC(ipcPath) {
    this._web3IPC = initIPC(ipcPath);
    return this._web3IPC;
  }

  /**
   * Checks the connection to the RPC provider
   * @return {bool} The true or false status of the RPC connection
   */
  check() {
    if (!this._web3) {
      return false;
    } else {
      return this._web3.isConnected();
    }
  }

  /**
   * Change the account address being used by the Ethereum object.
   * @param {number} index Index of the account address returned from web3.eth.accounts to change to.
   * @return {string} The account address now being used.
   */
  changeAccount(index) {
    this.initIPC();
    if (index < 0 || index >= this.accounts.length) {
      return this.account;
    } else {
      this.account = this.accounts[index];
      this._web3.eth.defaultAccount = this.account;
      return this.account;
    }
  }

  /**
   * Creates a new Ethereum account. The account will be located in your geth Ethereum directory in a JSON file encrpyted with the password provided. process.exit() needs to be called in Promise or the method will run indefinately. Don't use process.exit() if using method in Electron.
   * @param {string} password - The password to create the new account with.
   * @return {Promise} Promise return is a string with the newly created account's address.
   */
  createAccount(password) {
    this.initIPC();
    return createAccount(password, this._web3IPC);
  }

  /**
   * Unlocks an Ethereum account. process.exit() needs to be called in Promise or the method will run indefinately. Don't use process.exit() if using method in Electron.
   * @param {string} address - The address of the account.
   * @param {string} password - Password of account.
   * @param {number} timeLength - Time in seconds to have account remain unlocked for.
   * @return {boolean} Status if account was sucessfully unlocked.
   */
  unlockAccount(address, password, timeLength) {
    this.initIPC();
    return unlockAccount(address, password, timeLength, this._web3IPC);
  }

  /**
   * Get the Ether balance of an account in Ether denomination.
   * @param {number} index - Index of the account to check the balance of in Ether.
   * @return {number} The amount of Ether contained in the account.
   */
  getBalanceEther(index) {
    this.init();
    let amount;
    if (!index) {
      amount = this._web3.eth.getBalance(this.account);
    } else if (index < 0 || index >= this.accounts.length) {
      amount = this._web3.eth.getBalance(this.account);
    } else {
      amount = this._web3.eth.getBalance(this.accounts[index]);
    }
    return Number(this._web3.fromWei(amount, 'ether').toString());
  }

  /**
   * Get the Ether balance of an account in Wei denomination. 1 Ether = 1,000,000,000,000,000,000 wei
   * @param {number} index - Index of the account to check the balance of inWei.
   * @return {number} The amount of Ether in Wei contained in the account.
   */
  getBalanceWei(index) {
    this.init();
    let amount;
    if (!index) {
      amount = this._web3.eth.getBalance(this.account);
    } else if (index < 0 || index >= this.accounts.length) {
      amount = this._web3.eth.getBalance(this.account);
    } else {
      amount = this._web3.eth.getBalance(this.accounts[index]);
    }
    return Number(amount.toString());
  }

  /**
   * Convert an Ether amount to Wei
   * @param {number} amount - Amount to convert. Can also be a BigNumber object.
   * @return {number} Converted Wei amount.
   */
  toWei(amount) {
    this.init();
    return Number(this._web3.toWei(amount, 'ether').toString());
  }

  /**
   * Convert a Wei amount to Ether.
   * @param {number} amount - Amount to convert. Can also be a BigNumber object.
   * @return {number} Converted Ether amount.
   */
  toEther(amount) {
    this.init();
    return Number(this._web3.fromWei(amount, 'ether').toString());
  }

  /**
   * Deploy a built contract.
   * @param {string} contractName - Name of built contract located in the directory provided in Ethereum.config.built.
   * @param {Array} args - Arguments to be passed into the deployed contract as initial parameters.
   * @param {Object} options - Transaction options. Options are: {from: contract address, value: number, gas: number, gasValue: number}.
   * @return {Promise} The response is a Contract object of the deployed instance.
   */
  deploy(contractName, args, options) {
    this.init();
    const contract = this._getBuiltContract(contractName);
    // need to add more default options
    if (!options) {
      options = this.options;
    }
    contract.defaults(options);
    contract.setProvider(this._provider);
    const contractInstance = contract.new.apply(contract, args);
    // const address = '0x200cd7a869642959b39cc7844cc6787d598ffc63';
    //
    // this.execAt2('DeStore', address, 'receiverAdd');
    return contractInstance;
  }

  /**
   * Calls a deployed contract. Will take the address provided in the config address
   * @param {string} contractName - Name of built contract located in the directory provided in Ethereum.config.built.
   * @return {Contract} Contract object that you can call methods with.
   */
  exec(contractName) {
    this.init();
    const contract = this._getBuiltContract(contractName);
    contract.defaults(this.options);
    contract.setProvider(this._provider);
    const contractAddress = Contracts.get(contractName);
    const contractInstance = contract.at(contractAddress);
    return contractInstance;
  }

  /**
   * Calls a deployed contract at a specific address.
   * @param {string} contractName - Name of built contract located in the directory provided in Ethereum.config.built.
   * @param {string} contractAddress - Address of the contract.
   * @return {Contract} Contract object that you can call methods with.
   */
  execAt(contractName, contractAddress) {
    this.init();
    const contract = this._getBuiltContract(contractName);
    contract.defaults(this.options);
    contract.setProvider(this._provider);
    const contractInstance = contract.at(contractAddress);
    return contractInstance;
  }

  /**
   *
   * @return {Object} instance you can call watch(), get(), stopWatching()
   */
  // watchAt(contractName, contractAddress, method, filter) {
  //   this.init();
  //   const contractInstance = this.execAt(contractName, contractAddress);
  //   let event = contractInstance[method];
  //   event = event({}, filter);
  //   return event;
  // }

  /**
   * @param {string} contractName - Name of built contract located in the directory provided in Ethereum.config.built.
   * @param {string} contractAddress - Address of the contract.
   * @param {string} method - The name of the event method.
   * @param {Object} filter - Options to filter the events. Default: { address: contractAddress }.
   * @return {Promise} The response contains an array event logs.
  */
  getEventLogs(contractName, contractAddress, method, filter) {
    this.init();
    if (!filter) {
      filter = {
        address: contractAddress
      };
    }
    const contractInstance = this.execAt(contractName, contractAddress);
    let methodEvent = contractInstance[method];
    methodEvent = methodEvent({}, {
      fromBlock: 0
    });
    // MAJOR BUG. If it doesnt return any events it freezes
    return promisify((event, callback) => {
      event.get((err, logs) => {
        if (err) callback(err, null);
        else {
          const filteredLunlocogs = {};
          logs = logs.filter((element) => {
            for (let key in filter) {
              if (filter[key] !== element[key] && element[key] !== undefined) {
                return false;
              }
            }
            return true;
          });
          logs = logs.map(element => {
            return element.args;
          });
          callback(null, logs);
        }
      });
    })(methodEvent);
  }

}

module.exports = new Ethereum();
