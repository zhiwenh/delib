'use strict';
const promisify = require('es6-promisify');
const path = require('path');
const fs = require('fs');

const init = require('./init');
const initIPC = require('./initIPC');
const createAccount = require('./createAccount');
const unlockAccount = require('./unlockAccount');
const buildContracts = require('./buildContracts');
const optionsMerge = require('./utils/optionsMerge');
const optionsFilter = require('./utils/optionsFilter');
const optionsFormat = require('./utils/optionsFormat');
const coder = require('./web3/solidity/coder');

// Model
const Addresses = require('./../models/Addresses');

const config = require('./../config/config.js');

// Path from this file to your project's root or from where you run your script.
const RELATIVE_PATH = path.relative(__dirname, config.projectRoot); // allows building and requiring built contracts to the correct directory paths

// Percentage of gas to estimate above
const EST_GAS_INCREASE = 0.05;
// Percentage to round gas limit down
const GAS_LIMIT_DECREASE = 0.03;


/**
 * Create an Ethereum object. Will need to use Ethereum.init() to connect to the Web3 RPC provider and use the Ethereun object methods
 */

function Ethereum() {
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

  this.accountIndex = 0; // The default account index used for methods

  /** The transaction options allowed for Ethereum */
  this.options = {
    from: null,
    to: null,
    value: null,
    gas: 0,
    gasValue: null,
    data: null,
    nonce: null
  };

  /** THe options ulti methods */
  this.optionsMerge = optionsMerge;
  this.optionsFormat = optionsFormat;
  this.optionsFilter = optionsFilter;

  /** Does the necessary option adjustments */
  this.optionsUtil = (mergeOptions, options) => {
    options = Object.assign({}, options);
    options = optionsMerge(mergeOptions, options);
    options = optionsFormat(options);
    options = optionsFilter(options);
    return options;
  };

  this.address = Addresses;

  // Paths to the contracts, built, and addresses
  this.contractOptions = {
    path: config.contracts.path,
    built: config.contracts.built,
    address: config.contracts.address
  };

  /**
   * @param {string} contractName Name of contract in the directory path provided in Ethereum.contract.build
   * @returns {Contract} The built contract
   */
  this._getBuiltContract = (contractName) => {
    const contractPath = path.join(RELATIVE_PATH, this.contractOptions.built, contractName + '.sol.js');
    const contract = require(contractPath);
    return contract;
  };

  /**
   * Check the status of a certain connection type and throws error if not connected
   * @param {string} type - The connection type to test the status of. 'rpc', 'ipc'. Defaults to the current provider type.
   */
  this._checkConnectionError = (type) => {
    if (!this.connectionType) {
      throw new Error ('Not connected to any provider');
    }
    type = type || this.connectionType;
    type = type.toLowerCase();
    if (!this.checkConnection(type)) {
      throw new Error('Invalid ' + type + ' connection');
    }
  };


  /**
   * Sets up connection to RPC and IPC providers. Initializes the RPC and IPC connection with a local Ethereum node. The RPC provider is set in Ethereum.config.rpc.port. Need to call before using the Ethereum object. If RPC connection is already initalized and valid the RPC connection will be set to the current provider.
   * @param {string} rpcHost - The host URL path to the RPC connection. Optional. If not given the rpcHost path will be taken from Ethereum.config.rpc.host.
   * @param {number} rpcPort - The port number to the RPC connection. Optional. If not given the rpcPort path will be taken from Ethereum.config.rpc.port.
   * @returns {Web3} The Web3 object Ethereum uses set up to the RPC provider
   */
  this.init = (rpcHost, rpcPort) => {
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
      } else { // try and connect via ipc if rpc doesn't work
        throw new Error('Unable to connect to RPC provider');
      }
      this._init = true;
    }
    return this.web3; // Return web3 object used
  };


  /**
   * Initializes an IPC connection with a local Ethereum node. The IPC provider is set in Ethereum.config.ipc.host. Need to call before using the Ethereum object IPC methods.
   * @param {string} ipcPath Path to the IPC provider. Example for Unix: process.env.HOME + '/Library/Ethereum/geth.ipc'
   * @returns {Web3} The Web3 object delib.eth uses for its IPC connection.
   */
  this.initIPC = (ipcPath) => {
    this.web3IPC = initIPC(ipcPath) || this.web3IPC;
    this._ipcProvider = this.web3IPC.currentProvider;

    if (this._init === false) {
      if (!this.checkConnection('ipc')) {
        throw new Error('Unable to connect to IPC provider');
      }
      this.changeProvider('ipc');
      this._init = true;
      this.web3 = this.web3IPC;
    }
    return this.web3IPC;
  };

  /**
   * Closes the IPC connection
   * @returns {boolean} - Status of the IPC connection
   */
  this.closeIPC = () => {
    if (this.checkConnection('ipc')) {
      this.web3IPC.currentProvider.connection.destroy();
      return this.web3IPC.currentProvider.connection.destroyed;
    }
    return true;
  };

  /**
   * Check the status of a certain connection type.
   * @param {string} type - The connection type to test the status of. 'rpc', 'ipc'. Defaults to the current provider type.
   */
  this.checkConnection = (type) => {
    // If type is undefined check current type being used
    type = type || this.connectionType;
    type = type.toLowerCase();
    if (type === 'rpc') {
      return this.web3RPC ? this.web3RPC.isConnected() : false;
    }
    if (type === 'ipc') {
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
  };

  /**
   * Change the provider to use
   * @param {string} type - The provider to change to. Options are 'rpc' or 'ipc'
   * @returns {bool} - If the change went thru. True/false
   */
  this.changeProvider = (type) => {
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
  };

  /**
   * Checks the connection to the RPC provider
   * @return {bool} The true or false status of the RPC connection
   */
  this.check = () => {
    if (!this.web3) {
      return false;
    } else {
      return this.web3.isConnected();
    }
  };


  /**
   * Builds Solidity contracts.
   * @param {array} contractFiles Array of contract file names in the directory path provided in Ethereum.config.contracts
   * @param {string} contractPath Optional. Directory path where contract files are located. If none is given the directory path will be retrieved from config.path.
   * @param {string} buildPath Optional. Directory path where built contracts will be put. If none is given the directory path will be retrieved from config.built.
   * @returns {Promise} - Promise returns an array he contract names built.
   */
  this.build = (contractFiles, contractPath, buildPath) => {
    this._checkConnectionError('rpc');
    contractPath = (contractPath) ? path.join(__dirname, RELATIVE_PATH, contractPath) : path.join(__dirname, RELATIVE_PATH, this.contractOptions.path);
    buildPath = (buildPath) ? path.join(__dirname, RELATIVE_PATH, buildPath) : path.join(__dirname, RELATIVE_PATH, this.contractOptions.built);
    return buildContracts(contractFiles, contractPath, buildPath);
  };

  /**
   * Deploy a built contract.
   * @param {string} contractName - Name of built contract located in the directory provided in Ethereum.config.built.
   * @param {Array} args - Arguments to be passed into the deployed contract as initial parameters.
   * @param {Object} options - Transaction options. Options are: {from: contract address, value: number, gas: number, gasValue: number}.
   * @return {Promise} The response is a Contract object of the deployed instance.
   */
  this.deploy = (contractName, args, options) => {
    this._checkConnectionError();
    args = Array.isArray(args) ? args : [args];
    options = this.optionsUtil(this.options, options);
    const contract = this._getBuiltContract(contractName);
    contract.setProvider(this.provider);
    var self = this;

    return promisify(callback => {
      if (options.gas && options.gas > 0) {
        deployInstance(options);
        return;
      }
      // Only estimate gas if options.gas is 0 or null
      self.deploy.estimate(contractName, args, options)
        .then(gasEstimate => {
          options.gas = Math.round(gasEstimate + gasEstimate * EST_GAS_INCREASE);
          deployInstance(options);
        })
        .catch(err => {
          callback(err, null);
        });

      // Deploys the contract and returns the instance only after its address is saved
      function deployInstance(deployOptions) {
        promisify(self.web3.eth.getAccounts)()
          .then(accounts => {
            deployOptions.from = deployOptions.from || accounts[self.accountIndex];
            contract.defaults(deployOptions);
            const contractInstance = contract.new.apply(contract, args);
            return contractInstance;
          })
          .then(instance => {
            Addresses.set(contractName, instance.address);
            callback(null, instance);
          })
          .catch(err => {
            callback(err, null);
          });
      }
    })();
  };

  /**
   * Estimates the gas usage for a deployed contract
   * @param {string} contractName - Name of the built contract located in this.contracts.built
   * @param {Array} args - An array of arugments for the constructor of the deployed contract
   * @param {Object} options - The options for the transaction. Gas cost used for deployment will be the gas limit.
   * @returns {number} The estimated gas of deployment.
   */
  this.deploy.estimate = (contractName, args, options) => {
    this._checkConnectionError();
    args = Array.isArray(args) ? args : [args];
    options = this.optionsUtil(this.options, options);
    const contract = this._getBuiltContract(contractName);
    contract.setProvider(this.provider);
    return promisify(callback => {
      promisify(this.web3.eth.getAccounts)()
        .then(accounts => {
          options.from = options.from || accounts[this.accountIndex];
          return promisify(this.web3.eth.getBlock)('latest');
        })
        .then(block => {
          const transactionOptions = Object.assign({}, options);
          transactionOptions.gas = Math.round(block.gasLimit - block.gasLimit * GAS_LIMIT_DECREASE);
          let bytes = contract.unlinked_binary;

          bytes += (args) ? encodeConstructorParams(contract.abi, args) : '';
          transactionOptions.data = bytes;
          return promisify(this.web3.eth.estimateGas)(transactionOptions);
        })
        .then(gasEstimate => {
          callback(null, gasEstimate);
        })
        .catch(err => {
          callback(err, null);
        });
    })();

    /**
     * Called to encode constructor params. Taken from web3 library
     * @method encodeConstructorParams
     * @param {Array} abi - contract.abi
     * @param {Array} constructor params
     */
    function encodeConstructorParams(abi, params) {
      return abi.filter(function (json) {
        return json.type === 'constructor' && json.inputs.length === params.length;
      }).map(function (json) {
        return json.inputs.map(function (input) {
          return input.type;
        });
      }).map(function (types) {
        return coder.encodeParams(types, params);
      })[0] || '';
    }
  };

  /**
   * Calls a deployed contract. Will take the address provided in the config address
   * @param {string} contractName - Name of built contract located in the directory provided in Ethereum.config.built.
   * @return {Contract} Contract object that you can call methods with.
   */
  this.exec = (contractName) => {
    const contractAddress = Addresses.get(contractName);
    return this.execAt(contractName, contractAddress);
  };

  /**
   * Calls a deployed contract at a specific address.
   * @param {string} contractName - Name of built contract located in the directory provided in Ethereum.config.built.
   * @param {string} contractAddress - Address of the contract.
   * @return {Contract} Contract object that you can call methods with.
   */
  this.execAt = (contractName, contractAddress) => {
    this._checkConnectionError();
    const contract = this._getBuiltContract(contractName);
    contract.setProvider(this.provider);
    const contractInstance = contract.at(contractAddress);

    /**
     * Create mockContract to add new behavior to contract methods
     */
    const mockContract = {};
    mockContract.estimate = {}; // Gas estimate method

    // Gets all properties in contractInstance. Overwrites all contract methods with new functions and re references all the others.
    for (let key in contractInstance) {
      // Overwrite contract methods
      if (typeof contractInstance[key] === 'function' && typeof contractInstance[key].sendTransaction === 'function') {
        const methodName = key;
        // Re reference the default contract methods with __methodName
        mockContract['__' + key] = contractInstance[methodName];
        /**
         * Creation of gas estimate method
         */
        mockContract.estimate[methodName] = (...args) => {
          let options = this.options;
          if (typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
            options = this.optionsUtil(options, args[args.length - 1]);
            args.pop();
          } else {
            options = this.optionsUtil(options, {});

          }
          return promisify(callback => {
            promisify(this.web3.eth.getAccounts)()
              .then(accounts => {
                options.from = options.from || accounts[this.accountIndex];
                return promisify(this.web3.eth.getBlock)('latest');
              })
              .then(block => {
                options.gas =  Math.round(block.gasLimit - block.gasLimit * GAS_LIMIT_DECREASE);
                args.push(options);
                return contractInstance[methodName].estimateGas.apply(contractInstance, args);
              })
              .then(gasEstimate => {
                callback(null, gasEstimate);
              })
              .catch(err => {
                callback(err, null);
              });
          })();
        };

        /**
         * Actual method. Estimates the gas cost if gas is 0 or not there.
         */
        mockContract[methodName] = (...args) => {
          let options = this.options;
          // Checks to see if a transaction object got put into method call
          if (typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
            options = this.optionsUtil(options, args[args.length - 1]);
            args.pop();
          } else {
            options = this.optionsUtil(options, {});
          }
          // Only estimate gas if it doesn't exist or if its 0
          if (options.gas && options.gas != 0) {
            args.push(options);
            return contractInstance[methodName].apply(contractInstance, args);
          }

          return promisify((callback) => {
            // Get the estimate transaction options. Set gas at the gas limit
            promisify(this.web3.eth.getAccounts)()
              .then(accounts => {
                options.from = options.from || accounts[this.accountIndex];
                return promisify(this.web3.eth.getBlock)('latest');
              })
              .then(block => {
                options.gas =  Math.round(block.gasLimit - block.gasLimit * GAS_LIMIT_DECREASE);
                args.push(options);
                return contractInstance[methodName].estimateGas.apply(contractInstance, args);
              })
              .then(gasEstimate => {
                // Change options to the estimated gas price
                options.gas = Math.round(gasEstimate + gasEstimate * EST_GAS_INCREASE);
                contract.defaults(options);
                args.pop();
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
        };
      } else {
        // Re references all other properties
        mockContract[key] = contractInstance[key];
      }
    }
    return mockContract;
  };

  /**
   * Gets the event logs for an event
   * @param {string} contractName - Name of built contract located in the directory provided in Ethereum.config.built.
   * @param {string} contractAddress - Address of the contract.
   * @param {string} eventName - The name of the event method.
   * @param {number} blocksBack - The blocks back to get logs for. 'all' gets all blocks.
   * @param {Object} filter - Options to filter the events. Optional. Defaults to: { address: contractAddress }.
   * @return {Promise} The response contains an array event logs.
  */
  this.events = (contractName, eventName, blocksBack, filter) => {
    const contractAddress = Addresses.get(contractName);
    return this.eventsAt(contractName, contractAddress, eventName, blocksBack, filter);
  };

  /**
   * Gets the event logs for an event at a specific addess
   * @param {string} contractName - Name of built contract located in the directory provided in Ethereum.config.built.
   * @param {string} contractAddress - Address of the contract.
   * @param {string} eventName - The name of the event method.
   * @param {number} blocksBack - The blocks back to get logs for. 'all' gets all blocks.
   * @param {Object} filter - Options to filter the events. Optional. Defaults to: { address: contractAddress }.
   * @return {Promise} The response contains an array event logs.
  */
  this.eventsAt = (contractName, contractAddress, eventName, blocksBack, filter) => {
    this._checkConnectionError();
    const contract = this._getBuiltContract(contractName);
    contract.setProvider(this.provider);
    const contractInstance = contract.at(contractAddress);
    return promisify(callback => {
      promisify(this.web3.eth.getBlock)('latest')
        .then(block => {
          filter = (filter && typeof filter === 'object') ? filter : {};
          // Create the default contract address filter
          filter.address = filter.hasOwnProperty('address') ? filter.address : contractAddress;
          // Create the default args filter
          filter.args = (filter.args && typeof filter === 'object') ? filter.args : {};

          let fromBlock = (!blocksBack || blocksBack === 'all') ?  0 : block.number - blocksBack;
          const toBlock = 'latest';
          let methodEvent = contractInstance[eventName];
          methodEvent = methodEvent({}, { fromBlock: fromBlock, toBlock: toBlock });
          methodEvent.get((err, logs) => {
            if (err) {
              callback(err, null);
              return;
            }
            /** Filters the logs */
            logs = logs.filter(log => {
              for (let key in filter) {
                if (key === 'args') {
                  for (let key in filter.args) {
                    if (log.args[key] === undefined || filter.args[key] === null) continue;
                    if (typeof filter.args[key] === 'function') {
                      if (filter.args[key](log.args[key]) !== true) return false;
                    } else if (filter.args[key] !== log.args[key]) {
                      return false;
                    }
                  }
                  continue;
                }
                // If filter value is a function pass log value in as callback for filter
                if (log[key] === undefined || filter[key] === null) continue;
                if (typeof filter[key] === 'function') {
                  if (filter[key](log[key]) !== true) return false;
                } else if (filter[key] !== log[key]) {
                  return false;
                }
              }
              return true;
            });

            callback(null, logs);
          });
        })
        .catch(err => {
          callback(err, null);
        });
    })();
  };

  /**
   * Get the balance of an account.
   * @param {number} index - Index of the account to check the balance of in Ether.
   * @param {string} type - The denomination. Default: 'ether'
   * @return {number} The amount of Ether contained in the account.
   */
  this.getBalance = (index, type) => {
    type = type || 'ether';
    this._checkConnectionError();
    if (this.connectionType === 'ipc') {
      return promisify(callback => {
        promisify(this.web3.eth.getAccounts)()
          .then(accounts => {
            index = (index && index >= 0 && index < accounts.length) ? index : 0;
            return promisify(this.web3.eth.getBalance)(accounts[index]);
          })
          .then(amount => {
            callback(null, Number(this.web3.fromWei(amount, type).toString()));
          })
          .catch(err => {
            callback(err , null);
          });
      })();
    }
    index = (index && index >= 0 && index < this.web3.eth.accounts.length) ? index : 0;
    const amount = this.web3.eth.getBalance(this.web3.eth.accounts[index]);
    return Number(this.web3.fromWei(amount, type).toString());
  };

  /**
   * Creates a new Ethereum account. The account will be located in your geth Ethereum directory in a JSON file encrpyted with the password provided. process.exit() needs to be called in Promise or the method will run indefinately. Don't use process.exit() if using method in Electron.
   * @param {string} password - The password to create the new account with.
   * @return {Promise} Promise return is a string with the newly created account's address.
   */
  this.createAccount = (password) => {
    this._checkConnectionError('ipc');
    return createAccount(password, this.web3IPC);
  };

  /**
   * Unlocks an Ethereum account. process.exit() needs to be called in Promise or the method will run indefinately. Don't use process.exit() if using method in Electron.
   * @param {string} address - The address of the account.
   * @param {string} password - Password of account.
   * @param {number} timeLength - Time in seconds to have account remain unlocked for.
   * @return {boolean} Status if account was sucessfully unlocked.
   */
  this.unlockAccount = (index, password, timeLength) => {
    this._checkConnectionError('ipc');
    return unlockAccount(index, password, timeLength, this.web3IPC);
  };


  /****************************************/
  /************** DEPRECATED **************/
  /****************************************/

  this.account;
  this.accounts = [];

  /** Depreciated version of build */
  this.buildContracts = (contractFiles, contractPath, buildPath) => {
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
  };

  /**
   * Change the account address being used by the Ethereum object.
   * @param {number} index Index of the account address returned from web3.eth.accounts to change to.
   * @return {string} The account address now being used.
   */
  this.changeAccount = (index) => {
    if (index < 0 || index >= this.accounts.length) {
      return this.account;
    } else {
      this.accountIndex = index;
      this.account = this.accounts[index];
      return this.account;
    }
  };

  this.initRPC = (rpcHost, rpcPort) => {
    this.web3RPC = init(rpcHost, rpcPort) || this.web3RPC;
    this._rpcProvider = this.web3RPC.currentProvider;

    if (this._init === false) {
      if (!this.checkConnection('ipc')) {
        throw new Error('Unable to connect to IPC provider');
      }
      this.changeProvider('rpc');
      this.accounts = this.web3RPC.eth.accounts; // GET THIS TO WORK WITH IPC
      this._init = true;
    }

    return this.web3RPC;
  };

  /**
   * Convert an Ether amount to Wei
   * @param {number} amount - Amount to convert. Can also be a BigNumber object.
   * @return {number} Converted Wei amount.
   */
  this.toWei = (amount) => {
    this._checkConnectionError();
    return Number(this.web3.toWei(amount, 'ether').toString());
  };

  /**
   * Convert a Wei amount to Ether.
   * @param {number} amount - Amount to convert. Can also be a BigNumber object.
   * @return {number} Converted Ether amount.
   */
  this.toEther = (amount) => {
    this._checkConnectionError();
    return Number(this.web3.fromWei(amount, 'ether').toString());
  };

  /**
   * Get the Ether balance of an account in Ether denomination.
   * @param {number} index - Index of the account to check the balance of in Ether.
   * @return {number} The amount of Ether contained in the account.
   */
  this.getBalanceEther = (index) => {
    this._checkConnectionError();
    if (this.connectionType === 'ipc') {
      return promisify(callback => {
        promisify(this.web3.eth.getAccounts)()
          .then(accounts => {
            index = (index && index >= 0 && index < accounts.length) ? index : 0;
            return promisify(this.web3.eth.getBalance)(accounts[index]);
          })
          .then(amount => {
            callback(null, this.web3.fromWei(amount, 'ether').toNumber());
          })
          .catch(err => {
            callback(err , null);
          });
      })();
    }
    index = (index && index >= 0 && index < this.web3.eth.accounts.length) ? index : 0;
    const amount = this.web3.eth.getBalance(this.web3.eth.accounts[index]);
    return this.web3.fromWei(amount, 'ether').toNumber();
  };

  /**
   * Get the Ether balance of an account in Wei denomination. 1 Ether = 1,000,000,000,000,000,000 wei
   * @param {number} index - Index of the account to check the balance of inWei.
   * @return {number} The amount of Ether in Wei contained in the account.
   */
  this.getBalanceWei = (index) => {
    this._checkConnectionError();
    if (this.connectionType === 'ipc') {
      return promisify(callback => {
        promisify(this.web3.eth.getAccounts)()
          .then(accounts => {
            index = (index && index >= 0 && index < accounts.length) ? index : 0;
            return promisify(this.web3.eth.getBalance)(accounts[index]);
          })
          .then(amount => {
            callback(null, amount.toNumber());
          })
          .catch(err => {
            callback(err , null);
          });
      })();
    }
    index = (index && index >= 0 && index < this.web3.eth.accounts.length) ? index : 0;
    const amount = this.web3.eth.getBalance(this.web3.eth.accounts[index]);
    return this.web3.fromWei(amount, 'wei').toNumber();
  };
}
module.exports = new Ethereum();
