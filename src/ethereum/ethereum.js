'use strict';
const promisify = require('es6-promisify');
const path = require('path');
const fs = require('fs');

const contracts = require('./contracts');
const init = require('./init');
const initIPC = require('./initipc');
const createAccount = require('./createaccount');
const unlockAccount = require('./unlockaccount');
const build = require('./build');
const optionsMerge = require('./utils/optionsmerge');
const optionsFilter = require('./utils/optionsfilter');
const optionsFormat = require('./utils/optionsformat');
const logFilter = require('./utils/logfilter');
const coder = require('./web3/solidity/coder');
const config = require('./../config/config.js');

// Path from this file to your project's root or from where you run your script.
const RELATIVE_PATH = path.relative(__dirname, config.projectRoot); // allows building and requiring built contracts to the correct directory paths

/**
 * Create an Ethereum object. Will need to use Ethereum.init() to connect to the Web3 RPC provider and use the Ethereun object methods
 */
function Ethereum() {
  this.web3; // Web3 object used by library
  this.web3RPC; // Web3 RPC object
  this.web3IPC; // Web3 IPC object
  this.gasAdjust = 0; // Deploy and exec gas estimate adjustments

  this._connectionType;
  this._provider; // Provider to use for methods

  /** Account index used for transactions */
  this.account = 0;

  /** Default options */
  this.options = {
    /** Default transaction options */
    from: undefined,
    to: undefined,
    value: undefined,
    gas: 0,
    gasPrice: undefined,
    data: undefined,
    nonce: undefined,

    /** Default delib options*/
    account: undefined,
    maxGas: undefined
  };

  /** Contains contract related properties and methods */
  this.contracts = contracts;

  /**
   *
   * @param {string} rpcHost
   * @param {number} rpcPort
   * @returns {Web3}
   */
  this.init = (rpcHost, rpcPort) => {
    this.web3RPC = init(rpcHost, rpcPort);
    this._connectionType = 'rpc';
    this._provider = undefined;

    if (this.checkConnection('rpc')) {
      this.web3 = this.web3RPC;
      this._provider = this.web3RPC.currentProvider;
    }

    return this.web3; // Return web3 object used
  };

  /**
   *
   * @param {string} ipcPath
   * @returns {Web3}
   */
  this.initIPC = (ipcPath) => {
    this.web3IPC = initIPC(ipcPath);
    this._connectionType = 'ipc';
    this._provider = undefined;

    if (this.checkConnection('ipc')) {
      this.web3 = this.web3IPC;
      this._provider = this.web3IPC.currentProvider;
    }

    return this.web3;
  };

  /**
   *
   * @returns {boolean}
   */
  this.closeIPC = () => {
    if (this.checkConnection('ipc')) {
      this.web3IPC.currentProvider.connection.destroy();
      return this.web3IPC.currentProvider.connection.destroyed;
    }
    return true;
  };

  /**
   *
   * @param {string} type
   * @returns {bool}
   */
  this.checkConnection = (type) => {
    // If type is undefined check current type being used
    type = type || this._connectionType;
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
   *
   * @param {string} type
   * @returns {bool}
   */
  this.changeProvider = (type) => {
    if (type === 'rpc' || type === 'RPC' && this.checkConnection('rpc')) {
      this.web3 = this.web3RPC;
      this._connectionType = 'rpc';
      this._provider = this.web3RPC.currentProvider;
      return true;
    }
    if (type === 'ipc' || type === 'IPC' && this.checkConnection('ipc')) {
      this.web3 = this.web3IPC;
      this._connectionType = 'ipc';
      this._provider = this.web3IPC.currentProvider;
      return true;
    }
    return false;
  };

  /**
   * Builds Solidity contracts.
   * @param {array} contractFiles
   * @param {string} contractPath
   * @param {string} buildPath
   * @returns {Promise}
   */
  this.build = (contractFiles, contractPath, buildPath) => {
    contractPath = (contractPath) ? path.join(__dirname, RELATIVE_PATH, contractPath) : path.join(__dirname, RELATIVE_PATH, this.contracts.paths.contract);
    buildPath = (buildPath) ? path.join(__dirname, RELATIVE_PATH, buildPath) : path.join(__dirname, RELATIVE_PATH, this.contracts.paths.built);
    return build(contractFiles, contractPath, buildPath);
  };

  /**
   *
   * @param {string} contractName
   * @returns {Contract}
   */
  this.builtContract = (contractName) => {
    const contractPath = path.join(RELATIVE_PATH, this.contracts.paths.built, contractName + '.sol.js');
    let contract;
    try {
      contract = require(contractPath);
    } catch (e) {
      throw e;
    }
    return contract;
  };


  /**
   * Deploy a built contract.
   * @param {string} contractName
   * @param {Array} args
   * @param {Object} options
   * @return {Promise}
   */
  this.deploy = (contractName, args, options) => {
    this._checkConnectionError();
    args = Array.isArray(args) ? args : [args];
    options = this._optionsUtil(this.options, options);
    const contract = this.builtContract(contractName);
    contract.setProvider(this._provider);
    var self = this;

    return promisify(callback => {
      if (options.gas && options.gas > 0) {
        deployInstance(options);
        return;
      }
      // Only estimate gas if options.gas is 0 or null
      options.gas = undefined;
      self.deploy.estimate(contractName, args, options)
        .then(gasEstimate => {
          options.gas = Math.round(gasEstimate + gasEstimate * self.gasAdjust);
          // Throw error if est gas is greater than max gas
          if (options.maxGas && options.gas > options.maxGas) {
            throw new Error('Gas estimate of ' + options.gas + ' is greater than max gas allowed ' + options.maxGas);
          }
          deployInstance(options);
        })
        .catch(err => {
          callback(err, null);
        });

      // Deploys the contract and returns the instance only after its address is saved
      function deployInstance(deployOptions) {
        promisify(self.web3.eth.getAccounts)()
          .then(accounts => {
            deployOptions.from = deployOptions.from || accounts[deployOptions.account] || accounts[self.account];
            args.push(deployOptions);
            const contractInstance = contract.new.apply(contract, args);
            return contractInstance;
          })
          .then(instance => {
            self.contracts.addresses.set(contractName, instance.address);
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
   * @param {string} contractName
   * @param {Array} args
   * @param {Object} options
   * @returns {number}
   */
  this.deploy.estimate = (contractName, args, options) => {
    this._checkConnectionError();
    args = Array.isArray(args) ? args : [args];
    options = this._optionsUtil(this.options, options);
    const contract = this.builtContract(contractName);
    contract.setProvider(this._provider);
    return promisify(callback => {
      promisify(this.web3.eth.getAccounts)()
        .then(accounts => {
          options.from = options.from || accounts[options.account] || accounts[this.account];
          const transactionOptions = Object.assign({}, options);
          transactionOptions.gas = undefined;
          let bytes = contract.unlinked_binary;
          bytes += (Array.isArray(args)) ? encodeConstructorParams(contract.abi, args) : '';
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
   * Calls a deployed contract
   * @param {string} contractName
   * @return {Contract}
   */
  this.exec = (contractName) => {
    const contractAddress = this.contracts.addresses.get(contractName);
    return this.execAt(contractName, contractAddress);
  };

  /**
   * Calls a deployed contract at a specific address.
   * @param {string} contractName
   * @param {string} contractAddress
   * @return {Contract} Contract
   */
  this.execAt = (contractName, contractAddress) => {
    this._checkConnectionError();
    const contract = this.builtContract(contractName);
    contract.setProvider(this._provider);
    const contractInstance = contract.at(contractAddress);
    /** Create mockContract to add new behavior to contract methods */
    const mockContract = {};
    mockContract.estimate = {}; // Gas estimate method
    mockContract.call = {}; // Gas estimate method

    // Gets all properties in contractInstance. Overwrites all contract methods with new functions and re references all the others.
    for (let key in contractInstance) {
      if (typeof contractInstance[key] === 'function' && typeof contractInstance[key].sendTransaction === 'function') {
        const methodName = key;

        // Re reference the default contract methods with __methodName
        mockContract['__' + key] = contractInstance[methodName];

        /** CALL METHOD */
        mockContract.call[methodName] = (...args) => {
          return promisify(callback => {
            const options = argOptions(args);

            promisify(this.web3.eth.getAccounts)()
              .then(accounts => {
                options.from = options.from || accounts[options.account] || accounts[this.account];
                args.push(options);
                return contractInstance[methodName].call.apply(contractInstance, args);
              })
              .then(value => {
                callback(null, value);
              })
              .catch(err => {
                callback(err, null);
              });
          })();
        };

        /** GAS ESTIMATE METHOD */
        mockContract.estimate[methodName] = (...args) => {
          return promisify(callback => {
            const options = argOptions(args);

            promisify(this.web3.eth.getAccounts)()
              .then(accounts => {
                options.from = options.from || accounts[options.account] || accounts[this.account];
                options.gas = undefined;
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

        /** ACTUAL METHOD */
        mockContract[methodName] = (...args) => {
          return promisify((callback) => {
            const options = argOptions(args);

            /** ACTUAL: NO GAS ESTIMATE */
            if (options.gas && options.gas != 0) {
              args.push(options);
              promisify(this.web3.eth.getAccounts)()
                .then(accounts => {
                  options.from = options.from || accounts[options.account] || accounts[this.account];
                  return contractInstance[methodName].apply(contractInstance, args);
                })
                .then(res => {
                  callback(null, res);
                })
                .catch(err => {
                  callback(err, null);
                });
              return;
            }

            /** ACTUAL: WITH GAS ESTIMATE */
            promisify(this.web3.eth.getAccounts)()
              .then(accounts => {
                options.from = options.from || accounts[options.account] || accounts[this.account];
                options.gas = undefined;
                args.push(options);
                return contractInstance[methodName].estimateGas.apply(contractInstance, args);
              })
              .then(gasEstimate => {
                // Change options to the estimated gas price
                options.gas = Math.round(gasEstimate + gasEstimate * this.gasAdjust);

                // Throw error if est gas is greater than max gas
                if (options.maxGas && options.gas > options.maxGas) {
                  throw new Error('Gas estimate of ' + options.gas + ' is greater than max gas allowed ' + options.maxGas);
                }

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

    /** Checks for options based on args */
    const self = this;
    function argOptions(args) {
      let options = self.options;
      if (typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
        options = self._optionsUtil(options, args[args.length - 1]);
        args.pop(); // Will chance the arg array passed in
      } else {
        options = self._optionsUtil(options, {});
      }
      return options;
    }

    return mockContract;
  };

  /**
   * Gets the event logs for an event
   * @param {string} contractName
   * @param {string} eventName
   * @param {number} blocksBack
   * @param {Object} filter
   * @return {Promise}
  */
  this.events = (contractName, eventName, blocksBack, filter) => {
    // const addressPath = path.join(__dirname, RELATIVE_PATH, this.contracts.paths.address);
    const contractAddress = this.contracts.addresses.get(contractName);
    return this.eventsAt(contractName, contractAddress, eventName, blocksBack, filter);
  };

  /**
   * Gets the event logs for an event at a specific address
   * @param {string} contractName
   * @param {string} contractAddress
   * @param {string} eventName
   * @param {number} blocksBack
   * @param {Object} filter
   * @return {Promise}
  */
  this.eventsAt = (contractName, contractAddress, eventName, blocksBack, filter) => {
    this._checkConnectionError();
    const contract = this.builtContract(contractName);
    contract.setProvider(this._provider);
    const contractInstance = contract.at(contractAddress);

    // Check to see if valid event
    if (eventName !== 'allEvents' && (typeof contractInstance[eventName] !== 'function' ||
      contractInstance[eventName].hasOwnProperty('call'))) {
      throw new Error('Invalid event: ' + eventName + ' is not an event of ' + contractName);
    }

    return promisify(callback => {
      promisify(this.web3.eth.getBlock)('latest')
        .then(block => {
          filter = (filter && typeof filter === 'object') ? filter : {};
          // Create the default contract address filter
          filter.address = filter.hasOwnProperty('address') ? filter.address : contractAddress;

          let fromBlock = (!blocksBack || blocksBack === 'all') ?  0 : block.number - blocksBack;
          const toBlock = 'latest';
          const eventFilter = { fromBlock: fromBlock, toBlock: toBlock };
          // Pass eventFilter twice to make it work with allEvents
          const myEvent = contractInstance[eventName](eventFilter, eventFilter);
          myEvent.get((err, logs) => {
            if (err) {
              callback(err, null);
              return;
            }
            /** Filters the logs */
            logs = logs.filter(log => {
              return logFilter(log, filter); // Returns true/false depending whether or not to keep log
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
   * Watch an event
   * @param {string} contractName
   * @param {string} eventName
   * @param {Object} filter
   * @param {Function} callback
   * @returns
   */
  this.watch = (contractName, eventName, filter, callback) => {
    const contractAddress = this.contracts.addresses.get(contractName);
    return this.watchAt(contractName, contractAddress, eventName, filter, callback);
  };

  /**
   * Watch an event at a specific address
   * @param {string} contractName
   * @param {string} contractAddress
   * @param {string} eventName
   * @param {Object} filter - Optional. Can replace with callback
   * @param {Function} callback
   * @returns
   */
  this.watchAt = (contractName, contractAddress, eventName, filter, callback) => {
    this._checkConnectionError();

    // Allow no filter to be passed in
    if (typeof filter === 'function' && !callback) {
      callback = filter;
    }

    const contract = this.builtContract(contractName);
    contract.setProvider(this._provider);
    const contractInstance = contract.at(contractAddress);

    // Check to see if valid event
    if (eventName !== 'allEvents' && (typeof contractInstance[eventName] !== 'function' ||
      contractInstance[eventName].hasOwnProperty('call'))) {
      throw new Error('Invalid event: ' + eventName + ' is not an event of ' + contractName);
    }

    let myEvent = contractInstance[eventName]();

    filter = (filter && typeof filter === 'object') ? filter : {};
    filter.address = filter.hasOwnProperty('address') ? filter.address : contractAddress;

    myEvent.watch((err, log) => {
      if (err) {
        callback(err, null);
      } else if (logFilter(log, filter)) {
        callback(null, log);
      }
    });

    return {
      stop: function() {
        myEvent.stopWatching();
      }
    };

  };

  /**
   *
   * @param {number} index
   * @param {string} type
   * @return {number}
   */
  this.getBalance = (index, type) => {
    type = type || 'ether';
    this._checkConnectionError();
    if (this._connectionType === 'ipc') {
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
   *
   * @param {string}
   * @return {Promise}
   */
  this.createAccount = (password) => {
    this._checkConnectionError('ipc');
    return createAccount(password, this.web3IPC);
  };

  /**
   *
   * @param {number} index
   * @param {string} password
   * @param {number} timeLength
   * @return {boolean}
   */
  this.unlockAccount = (index, password, timeLength) => {
    this._checkConnectionError('ipc');
    return unlockAccount(index, password, timeLength, this.web3IPC);
  };

  /** Performs necessary option adjustments
   * @param {Object} mergeOptions
   * @param {Object} options
   * @returns {Object}
   */
  this._optionsUtil = (mergeOptions, options) => {
    options = Object.assign({}, options);
    options = optionsMerge(mergeOptions, options);
    options = optionsFormat(options);
    options = optionsFilter(options);
    return options;
  };

  /**
   * Check the status of a certain connection type and throws error if not connected
   * @param {string} type - The connection type to test the status of. 'rpc', 'ipc'. Defaults to the current provider type.
   */
  this._checkConnectionError = (type) => {
    if (!this._connectionType) {
      throw new Error ('Not connected to any provider');
    }
    type = type || this._connectionType;
    type = type.toLowerCase();
    if (!this.checkConnection(type)) {
      throw new Error('Invalid ' + type + ' connection');
    }
  };

}
module.exports = new Ethereum();
