'use strict';
const promisify = require('es6-promisify');
const path = require('path');
const fs = require('fs');
const truffleContract = require('truffle-contract');
const contracts = require('./contracts');
const init = require('./init');
const initIPC = require('./initipc');
const initws = require('./initws');
const build = require('./build');
const optionsMerge = require('./utils/optionsmerge');
const optionsFilter = require('./utils/optionsfilter');
const optionsFormat = require('./utils/optionsformat');
const logFilter = require('./utils/logfilter');
const coder = require('web3-0.20.7/lib/solidity/coder');
const config = require('./../config/config.js');
const linker = require('solc/linker');

// Path from this file to your project's root or from where you run your script.
const RELATIVE_PATH = path.relative(__dirname, config.projectRoot); // allows building and requiring built contracts to the correct directory paths

/**
 * Create an Ethereum object. Will need to use Ethereum.init() to connect to the Web3 RPC provider and use the Ethereun object methods
 */
function Ethereum() {
  this.web3; // Web3 object used by library
  this.web3RPC; // Web3 RPC object
  this.web3IPC; // Web3 IPC object
  this.web3ws; // Web3 WS object
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
   * @param {string} rpcPath
   * @returns {Web3}
   */
  this.init = (rpcPath) => {
    this.web3RPC = init(rpcPath);
    this._connectionType = 'rpc';
    this.web3 = this.web3RPC;
    this._provider = this.web3RPC.currentProvider;

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
    this.web3 = this.web3IPC;
    this._provider = this.web3IPC.currentProvider;


    return this.web3;
  };

  /**
   *
   * @param {string} wsPath
   * @returns {Web3}
   */
  this.initws = (wsPath) => {
    this.web3ws = initws(wsPath);
    this._connectionType = 'ws';
    this.web3 = this.web3ws;
    this._provider = this.web3ws.currentProvider;

    return this.web3; // Return web3 object used
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
  this.builtContractDeployment = (contractName) => {
    const contractJSONPath = path.resolve(path.join(config.projectRoot, this.contracts.paths.built, contractName + '.json'));

    let contract;
    try {
      const contractJSONString = fs.readFileSync(contractJSONPath);
      const contractInfo = JSON.parse(contractJSONString);
      contract =  new this.web3.eth.Contract(contractInfo.abi);
    } catch (e) {
      throw e;
    }
    return contract;
  };

  this.builtContractExec = (contractName, address) => {
    const contractJSONPath = path.resolve(path.join(config.projectRoot, this.contracts.paths.built, contractName + '.json'));

    let contract;
    try {
      const contractJSONString = fs.readFileSync(contractJSONPath);
      const contractInfo = JSON.parse(contractJSONString);
      contract =  new this.web3.eth.Contract(contractInfo.abi, address);
    } catch (e) {
      throw e;
    }
    return contract;
  }

  this.getContractInfo = (contractName) => {
    const contractJSONPath = path.resolve(path.join(config.projectRoot, this.contracts.paths.built, contractName + '.json'));

    let contractInfo;
    try {
      const contractJSONString = fs.readFileSync(contractJSONPath);
      contractInfo = JSON.parse(contractJSONString);
    } catch (e) {
      throw e;
    }
    return contractInfo;
  };

  this.getByteCode = (contractName) => {
    const contractJSONPath = path.resolve(path.join(config.projectRoot, this.contracts.paths.built, contractName + '.json'));
    const contractJSONString = fs.readFileSync(contractJSONPath);
    const contractInfo = JSON.parse(contractJSONString);

    return contractInfo.bytecode;
  }

  /**
   * Deploy a built contract.
   * @param {string} contractName
   * @param {Array} args
   * @param {Object} options
   * @return {Promise}
   */
  this.deploy = (contractName, args, options, links) => {
    this._checkConnectionError();
    if (args === undefined) args = [];
    args = Array.isArray(args) ? args : [args];
    options = this._optionsUtil(this.options, options);
    const contract = this.builtContractDeployment(contractName);
    var self = this;

    return promisify(callback => {
      if (options.gas && options.gas > 0) {
        deployInstance(options);
        return;
      }
      // Only estimate gas if options.gas is 0 or null
      options.gas = undefined;
      self.deploy.estimate(contractName, args, options, links)
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
            let byteCode = self.getByteCode(contractName);
            if (links) {
              byteCode = linker.linkBytecode(byteCode, links);
            }

            return contract.deploy({data: byteCode, arguments: args}).send(deployOptions);
          })
          .then(instance => {
            self.contracts.addresses.set(contractName, instance.options.address, links);
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
  this.deploy.estimate = (contractName, args, options, links) => {
    this._checkConnectionError();
    if (args === undefined) args = [];
    args = Array.isArray(args) ? args : [args];
    options = this._optionsUtil(this.options, options);
    const contract = this.builtContractDeployment(contractName);
    return promisify(callback => {
      promisify(this.web3.eth.getAccounts)()
        .then(accounts => {
          options.from = options.from || accounts[options.account] || accounts[this.account];
          const transactionOptions = Object.assign({}, options);
          transactionOptions.gas = undefined;
          const contractInfo = this.getContractInfo(contractName);
          let byteCode = this.getByteCode(contractName);

          var linkReferences = linker.findLinkReferences(byteCode)
          if (links) {
            byteCode = linker.linkBytecode(byteCode, links);
          }

          return contract.deploy({data: byteCode, arguments: args}).estimateGas();
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
      const newArr = [];

      for (let i = 0; i < abi.length; i++) {
        newArr.push(abi[i]);
      }

      return newArr.filter(function (json) {
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
    const contract = this.builtContractExec(contractName, contractAddress);
    /** Create mockContract to add new behavior to contract methods */

    const mockContract = {};
    mockContract.estimate = {}; // Gas estimate method
    mockContract.call = {}; // Gas estimate method

    // Gets all properties in contractInstance. Overwrites all contract methods with new functions and re references all the others.
    for (let key in contract.methods) {
      if (typeof contract.methods[key] === 'function') {
        const methodName = key;

        // Re reference the default contract methods with __methodName
        mockContract['__' + key] = contract.methods[methodName];

        /** CALL METHOD */
        mockContract.call[methodName] = (...args) => {
          return promisify(callback => {
            const options = argOptions(args);

            promisify(this.web3.eth.getAccounts)()
              .then(accounts => {
                options.from = options.from || accounts[options.account] || accounts[this.account];
                return contract.methods[methodName](...args).call(options);
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
                return contract.methods[methodName](...args).estimateGas(options);
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
              promisify(this.web3.eth.getAccounts)()
                .then(accounts => {
                  options.from = options.from || accounts[options.account] || accounts[this.account];
                  return contract.methods[methodName](...args).send(options);
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

                // Throw error if est gas is greater than max gas
                if (options.maxGas && options.gas > options.maxGas) {
                  throw new Error('Gas estimate of ' + options.gas + ' is greater than max gas allowed ' + options.maxGas);
                }

                return contract.methods[methodName](...args).estimateGas(options);
              })
              .then(gasEstimate => {
                options.gas = gasEstimate;
                return contract.methods[methodName](...args).send(options);
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
        mockContract.method[key] = contract.method[key];
      }
    }

    const contractInfo = this.getContractInfo(contractName);

    mockContract.abi = contractInfo.abi;
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
    const contract = this.builtContractExec(contractName, contractAddress);

    // Check to see if valid event
    if (eventName !== 'allEvents' && (typeof contract.events[eventName] !== 'function' ||
      contract.events[eventName].hasOwnProperty('call'))) {
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
          eventFilter.filter = filter;
          contract.getPastEvents(eventName, eventFilter)
            .then(res => {
              callback(null, res);
            })
            .catch(err => {
              callback(err, null);
            })
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

    const contract = this.builtContractExec(contractName, contractAddress);

    // Check to see if valid event
    if (eventName !== 'allEvents' && (typeof contract.events[eventName] !== 'function' ||
    contract.events[eventName].hasOwnProperty('call'))) {
      throw new Error('Invalid event: ' + eventName + ' is not an event of ' + contractName);
    }

    filter = (filter && typeof filter === 'object') ? filter : {};
    filter.address = filter.hasOwnProperty('address') ? filter.address : contractAddress;

    const watchEvents = contract.events[eventName]({filter: filter, fromBlock: 0});
    watchEvents
      .on("data", (event) => {
        callback(null, event);
      })
      .on("error", (err) => {
        callback(err, null);
      })

    return {
      stop: function() {
        watchEvents.unsubscribe();
      }
    };

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
  };
}
module.exports = new Ethereum();
