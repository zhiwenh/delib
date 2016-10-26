'use strict';
const promisify = require('es6-promisify');
const path = require('path');
const fs = require('fs');

const init = require('./init.js');
const initIPC = require('./initIPC.js');
const createAccount = require('./createAccount');
const unlockAccount = require('./unlockAccount');
const buildContracts = require('./buildContracts');

// Model
const Contracts = require('./../models/Contracts.js');

const config = require('./../config/config.js');

// Path from this file to your project's root or from where you run your script.
const RELATIVE_PATH = path.relative(__dirname, config.projectRoot); // allows building and requiring built contracts to the correct directory paths

// Percentage of gas to estimate above
const EST_GAS_INCREASE = 0.05;
// Percentage to round gas limit down
const GAS_LIMIT_DECREASE = 0.03;

class Ethereum {
  /**
   * Create an Ethereum object. Will need to use Ethereum.init() to connect to the Web3 RPC provider and use the Ethereun object methods
   */
  constructor() {
    this.web3; // Web3 object used by library
    this.web3RPC; // Web3 RPC object
    this.web3IPC; // Web3 IPC object

    this._init = false; // If RPC or IPC has been initialized
    this._initRPC = false;
    this._initIPC = false;
    this.connectionType;

    this.provider; // Provider to use for methods
    this._rpcProvider; // RPC connection to Ethereum geth node
    this._ipcProvider;

    this.account;
    this.accounts = [];

    this.options = {
      from: this.account,
      to: null,
      value: 0,
      gas: 0,
      gasValue: null,
      data: null,
      nonce: null
      // gasValue: // ESTIMATE THIS
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
    let contract;
    let contractPath;
    if (this.contractOptions.path)
      contractPath = path.join(RELATIVE_PATH, this.contractOptions.path, contractName + '.sol.js');
    else
      contractPath = path.join(RELATIVE_PATH, config.contracts.built, contractName + '.sol.js');
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
   * @returns {Promise} - Promise returns an array he contract names built.
   */
  buildContracts(contractFiles, contractPath, buildPath) {
    this._checkConnectionError('rpc');
    if (!contractPath) {
      if (this.contractOptions.path) {
        contractPath = path.join(__dirname, RELATIVE_PATH, this.contractOptions.path);
      } else {
        contractPath = path.join(__dirname, RELATIVE_PATH, config.contracts.path);
      }
    }
    if (!buildPath) {
      if (this.contractOptions.built) {
        buildPath = path.join(__dirname, RELATIVE_PATH, this.contractOptions.built);
      }
      else {
        buildPath = path.join(__dirname, RELATIVE_PATH, config.contracts.built);
      }
    }
    return buildContracts(contractFiles, contractPath, buildPath);
  }

  /**
   * Sets up connection to RPC and IPC providers. Initializes the RPC and IPC connection with a local Ethereum node. The RPC provider is set in Ethereum.config.rpc.port. Need to call before using the Ethereum object. If RPC connection is already initalized and valid the RPC connection will be set to the current provider.
   * @param {string} rpcHost - The host URL path to the RPC connection. Optional. If not given the rpcHost path will be taken from Ethereum.config.rpc.host.
   * @param {number} rpcPort - The port number to the RPC connection. Optional. If not given the rpcPort path will be taken from Ethereum.config.rpc.port.
   * @param {Object} contractOptions - Options to set up the contract paths. Takes in path, built, and address properties.
   * @returns {Web3} The Web3 object Ethereum uses set up to the RPC provider
   */
  init(rpcHost, rpcPort, ipcPath) {
    if (this._init === false) {
      this.web3RPC = init(rpcHost, rpcPort);

      // Set the account bindings
      // Determine the Web3 object used by library and the provider. Default is rpc
      if (this.checkConnection('rpc')) {
        this._rpcProvider = this.web3RPC.currentProvider;

        this.web3 = this.web3RPC;
        this.connectionType = 'rpc';
        this.provider = this.web3RPC.currentProvider;

        this.accounts = this.web3RPC.eth.accounts; // GET THIS TO WORK WITH IPC
        this.account = this.accounts[0];
        this.options.from = this.account;
      } else { // try and connect via ipc if rpc doesn't work
        this.web3IPC = initIPC(ipcPath);
        if (this.checkConnection('ipc')) {
          this._ipcProvider = this.web3IPC.currentProvider;
          this.web3 = this.web3IPC;
          this.connectionType = 'ipc';
          this.provider = this.web3IPC.currentProvider;
        } else {
          throw new Error('Unable to connect to RPC or IPC provider');
        }
      }

      this._init = true;
    }
    return this.web3; // Return web3 object used
  }

  /**
   *
   */
  initRPC(rpcHost, rpcPort) {
    this.web3RPC = init(rpcHost, rpcPort) || this.web3RPC;
    this._rpcProvider = this.web3RPC.currentProvider;

    if (this._init === false) {
      this._checkConnectionError('rpc'); // Check error only if init
      this.changeProvider('rpc');
      this.accounts = this.web3RPC.eth.accounts; // GET THIS TO WORK WITH IPC
      this._init = true;
    }

    return this.web3RPC;
  }

  /**
   * Initializes an IPC connection with a local Ethereum node. The IPC provider is set in Ethereum.config.ipc.host. Need to call before using the Ethereum object IPC methods.
   * @param {string} ipcPath Path to the IPC provider. Example for Unix: process.env.HOME + '/Library/Ethereum/geth.ipc'
   * @returns {Web3} The Web3 object delib.eth uses for its IPC connection.
   */
  initIPC(ipcPath) {
    this.web3IPC = initIPC(ipcPath) || this.web3IPC;
    this._ipcProvider = this.web3IPC.currentProvider;

    if (this._init === false) {
      this._checkConnectionError('ipc');
      this.changeProvider('ipc');
      this._init = true;
    }
    return this.web3IPC;
  }

  /**
   * Closes the IPC connection
   * @returns {boolean} - Status of the IPC connection
   */
  closeIPC() {
    if (this.checkConnection('ipc')) {
      this.web3IPC.currentProvider.connection.destroy();
      return this.web3IPC.currentProvider.connection.destroyed;
    }
    return true;
  }

  /**
   * Change the provider to use
   * @param {string} type - The provider to change to. Options are 'rpc' or 'ipc'
   * @returns {bool} - If the change went thru. True/false
   */
  changeProvider(type) {
    if (type === 'rpc' || type === 'RPC' && this.checkConnection('rpc')) {
      this.web3 = this.web3RPC;
      this.connectionType = 'rpc';
      this.provider = this.web3RPC.currentProvider;
      return true;
    }
    if (type === 'ipc' || type === 'IPC' && this.checkConnection('ipc')) {
      this.web3 = this.web3IPC;
      this.connectionType = 'ipc';
      this.provider = this.web3IPC.currentProvider;
      return true;
    }
    return false;
  }

  /**
   * Checks the connection to the RPC provider
   * @return {bool} The true or false status of the RPC connection
   */
  check() {
    if (!this.web3) {
      return false;
    } else {
      return this.web3.isConnected();
    }
  }

  /**
   * Change the account address being used by the Ethereum object.
   * @param {number} index Index of the account address returned from web3.eth.accounts to change to.
   * @return {string} The account address now being used.
   */
  changeAccount(index) {
    if (index < 0 || index >= this.accounts.length) {
      return this.account;
    } else {
      this.account = this.accounts[index];
      return this.account;
    }
  }

  /**
   * Creates a new Ethereum account. The account will be located in your geth Ethereum directory in a JSON file encrpyted with the password provided. process.exit() needs to be called in Promise or the method will run indefinately. Don't use process.exit() if using method in Electron.
   * @param {string} password - The password to create the new account with.
   * @return {Promise} Promise return is a string with the newly created account's address.
   */
  createAccount(password) {
    this._checkConnectionError('ipc');
    return createAccount(password, this.web3IPC);
  }

  /**
   * Unlocks an Ethereum account. process.exit() needs to be called in Promise or the method will run indefinately. Don't use process.exit() if using method in Electron.
   * @param {string} address - The address of the account.
   * @param {string} password - Password of account.
   * @param {number} timeLength - Time in seconds to have account remain unlocked for.
   * @return {boolean} Status if account was sucessfully unlocked.
   */
  unlockAccount(address, password, timeLength) {
    this._checkConnectionError('ipc');
    return unlockAccount(address, password, timeLength, this.web3IPC);
  }

  /**
   * Deploy a built contract.
   * @param {string} contractName - Name of built contract located in the directory provided in Ethereum.config.built.
   * @param {Array} args - Arguments to be passed into the deployed contract as initial parameters.
   * @param {Object} options - Transaction options. Options are: {from: contract address, value: number, gas: number, gasValue: number}.
   * @return {Promise} The response is a Contract object of the deployed instance.
   */
  deploy(contractName, args, options) {
    this._checkConnectionError();
    options = this._optionsMerge(this.options, options);
    options = this._optionsFilter(options);
    options = this._optionsFormat(options);
    const contract = this._getBuiltContract(contractName);
    contract.setProvider(this.provider);

    // saves the address in a file to be referenced later in exec
    return promisify(callback => {
      // If the options gas is 0 or undefined then you estimate it
      if (options.gas == 0 || !options.gas) {
        const transactionOptions = Object.assign({}, options);
        const gasLimit = this.web3.eth.getBlock('latest').gasLimit;
        transactionOptions.gas = Math.round(gasLimit - gasLimit * GAS_LIMIT_DECREASE);
        transactionOptions.data = contract.unlinked_binary;

        this.web3.eth.estimateGas(transactionOptions, (err, estimateGas) => {
          if (err) {
            console.error(err);
            callback(null, err);
            return;
          }
          options.gas = Math.round(estimateGas + estimateGas * EST_GAS_INCREASE);
          deployInstance();
        });
      } else {
        deployInstance();
      }

      // Deploys the built contract
      function deployInstance() {
        contract.defaults(options);
        const contractInstance = contract.new.apply(contract, args);
        contractInstance
          .then(instance => {
            Contracts.set(contractName, instance.address);
            callback(null, instance);
          })
          .catch(err => {
            callback(err, null);
          });
      }
    })();
  }

  /**
   * Calls a deployed contract. Will take the address provided in the config address
   * @param {string} contractName - Name of built contract located in the directory provided in Ethereum.config.built.
   * @return {Contract} Contract object that you can call methods with.
   */
  exec(contractName, options) {
    const contractAddress = Contracts.get(contractName);
    return this.execAt(contractName, contractAddress, options);
  }

  /**
   * Calls a deployed contract at a specific address.
   * @param {string} contractName - Name of built contract located in the directory provided in Ethereum.config.built.
   * @param {string} contractAddress - Address of the contract.
   * @return {Contract} Contract object that you can call methods with.
   */
  execAt(contractName, contractAddress, options) {
    this._checkConnectionError();
    options = this._optionsMerge(this.options, options);
    options = this._optionsFilter(options);
    options = this._optionsFormat(options);

    const contract = this._getBuiltContract(contractName);
    contract.defaults(options);
    contract.setProvider(this.provider);

    const contractInstance = contract.at(contractAddress);
    // Will copy contractInstance and overwrite the its contract methods
    const mockContract = {};

    // Gets all properties in contractInstance. Overwrites all contract methods with new functions and re references all the others.
    for (let key in contractInstance) {
      // Overwrite contract methods
      if (typeof contractInstance[key] === 'function' && typeof contractInstance[key].sendTransaction === 'function') {
        const methodName = key;
        // Re reference the default contract methods with __methodName
        mockContract['__' + key] = contractInstance[methodName];

        mockContract[methodName] = (...args) => {
          // Checks to see if a transaction option got put into method call
          if (typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
            options = this._optionsMerge(options, args[args.length - 1]);
            options = this._optionsFilter(options);
            options = this._optionsFormat(options);
            args.pop();
          }
          args.push(options);
          // Only estimate gas if it doesn't exist or if its 0
          if (options.gas == 0 || !options.gas) {
            return promisify((callback) => {
              // Get the estimate transaction options. Set gas at the gas limit
              const estimateOptions = Object.assign({}, options);
              const gasLimit = this.web3.eth.getBlock('latest').gasLimit;
              estimateOptions.gas =  Math.round(gasLimit - gasLimit * GAS_LIMIT_DECREASE);
              args.push(estimateOptions);
              contractInstance[methodName].estimateGas.apply(contractInstance, args)
                .then(gasEstimate => {
                  args.pop();
                  // Change options to the estimated gas price
                  options.gas = Math.round(gasEstimate + gasEstimate * EST_GAS_INCREASE);
                  contract.defaults(options);
                  args.push(options);
                  return contractInstance[methodName].apply(contractInstance, args);
                })
                .then(res => {
                  callback(null, res);
                })
                .catch(err => {
                  callback(err, null);
                });
            })();
          } else {
            // Call this if gas is 0 or does not exist
            return contractInstance[methodName].apply(contractInstance, args);
          }
        };
      } else {
        // Re references all other properties
        mockContract[key] = contractInstance[key];
      }
    }
    return mockContract;
  }

  /**
   * Gets the event logs for an event
   * @param {string} contractName - Name of built contract located in the directory provided in Ethereum.config.built.
   * @param {string} contractAddress - Address of the contract.
   * @param {string} eventName - The name of the event method.
   * @param {number} fromBlock - The block number to start getting the event logs. Optional. Defaults to 0.
   * @param {Object} filter - Options to filter the events. Optional. Defaults to: { address: contractAddress }.
   * @return {Promise} The response contains an array event logs.
  */
  events(contractName, eventName, fromBlock, filter) {
    this._checkConnectionError();

    const contractAddress = Contracts.get(contractName);

    const contract = this._getBuiltContract(contractName);
    contract.setProvider(this.provider);
    const contractInstance = contract.at(contractAddress);

    filter = filter || {address: contractAddress};
    fromBlock = fromBlock || 0;

    let methodEvent = contractInstance[eventName];
    methodEvent = methodEvent({}, {
      fromBlock: fromBlock
    });
    return promisify((event, callback) => {
      event.get((err, logs) => {
        if (err) callback(err, null);
        else {
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

  /**
   * Check the status of a certain connection type.
   * @param {string} type - The connection type to test the status of. 'rpc', 'ipc'. Defaults to the current provider type.
   */
  checkConnection(type) {
    // If type is undefined check current type being used
    type = type || this.connectionType;
    if (type === 'rpc' || type === 'RPC') {
      return this.web3RPC ? this.web3RPC.isConnected() : false;
    }
    if (type === 'ipc' || type === 'IPC') {
      if (!this.web3IPC) return false;
      let status;
      try {
        status = this.web3IPC.isConnected();
      } catch(e) {
        status = false;
      }
      return status;
    }
    return false;
  }

  /**
   * Check the status of a certain connection type and throws error if not connected
   * @param {string} type - The connection type to test the status of. 'rpc', 'ipc'. Defaults to the current provider type.
   */
  _checkConnectionError(type) {
    if (this.connectionType === null) {
      throw new Error ('Not connected to any provider');
    }
    type = type || this.connectionType;
    if (!this.checkConnection(type)) {
      throw new Error('Invalid ' + type + ' connection');
    }
  }

  /**
   * Get the Ether balance of an account in Ether denomination.
   * @param {number} index - Index of the account to check the balance of in Ether.
   * @return {number} The amount of Ether contained in the account.
   */
  getBalanceEther(index) {
    this._checkConnectionError('rpc');
    let amount;
    if (!index) {
      amount = this.web3.eth.getBalance(this.account);
    } else if (index < 0 || index >= this.accounts.length) {
      amount = this.web3.eth.getBalance(this.account);
    } else {
      amount = this.web3.eth.getBalance(this.accounts[index]);
    }
    return Number(this.web3.fromWei(amount, 'ether').toString());
  }

  /**
   * Get the Ether balance of an account in Wei denomination. 1 Ether = 1,000,000,000,000,000,000 wei
   * @param {number} index - Index of the account to check the balance of inWei.
   * @return {number} The amount of Ether in Wei contained in the account.
   */
  getBalanceWei(index) {
    this._checkConnectionError('rpc');
    let amount;
    if (!index) {
      amount = this.web3.eth.getBalance(this.account);
    } else if (index < 0 || index >= this.accounts.length) {
      amount = this.web3.eth.getBalance(this.account);
    } else {
      amount = this.web3.eth.getBalance(this.accounts[index]);
    }
    return Number(amount.toString());
  }

  /**
   * Convert an Ether amount to Wei
   * @param {number} amount - Amount to convert. Can also be a BigNumber object.
   * @return {number} Converted Wei amount.
   */
  toWei(amount) {
    this._checkConnectionError('rpc');
    return Number(this.web3.toWei(amount, 'ether').toString());
  }

  /**
   * Convert a Wei amount to Ether.
   * @param {number} amount - Amount to convert. Can also be a BigNumber object.
   * @return {number} Converted Ether amount.
   */
  toEther(amount) {
    this._checkConnectionError('rpc');
    return Number(this.web3.fromWei(amount, 'ether').toString());
  }

  /**
   * Ulti for the transaction options. Compares refOptions to inOptions and gives it the properites inOptions doesnt have
   */
  _optionsMerge(refOptions, inOptions) {
    let options;
    if (typeof inOptions !== 'object' || Array.isArray[inOptions]) {
      options = Object.assign({}, refOptions);
    } else {
      options = Object.assign({}, inOptions);
      /** Combines the objects */
      for (let key in refOptions) {
        if (!options.hasOwnProperty(key)) {
          options[key] = refOptions[key];
        }
      }
    }

    return options;
  }

  /** Filters out the unneeded options */
  _optionsFilter(options) {
    options = Object.assign({}, options);

    for (let key in options) {
      if (this._allowedOptions[key] !== true || options[key] === null) {
        delete options[key];
      }
      // Puts everything into numbers
      if (key === 'gas' && typeof options[key] !== 'number') options[key] = options[key] = Number(options[key]);
      if (key === 'value' && typeof options[key] !== 'number') options[key] = options[key] = Number(options[key]);
      if (key === 'gasPrice' && typeof options[key] !== 'number') options[key] = options[key] = Number(options[key]);
    }
    return options;
  }

  /** To format all the options into their correct value types. Call after optionsFilter*/
  _optionsFormat(options) {
    options = Object.assign({}, options);
    for (let key in options) {
      // Put everything that needs to be numbers into numbers
      if (key === 'gas' && typeof options[key] !== 'number') options[key] = options[key] = Number(options[key]);
      if (key === 'value' && typeof options[key] !== 'number') options[key] = options[key] = Number(options[key]);
      if (key === 'gasPrice' && typeof options[key] !== 'number') options[key] = options[key] = Number(options[key]);
    }

    return options;
  }
}

/** The transaction options allowed for Ethereum */
Ethereum.prototype._allowedOptions = {
  from: true,
  to: true,
  value: true,
  gas: true,
  gasPrice: true,
  data: true,
  nonce: true
};

module.exports = new Ethereum();
