'use strict';
const Web3 = require('web3');
const ethers = require('ethers');
const promisify = require('es6-promisify');
const path = require('path');
const fs = require('fs');
const init = require('./init');
const initIPC = require('./initipc');
const initws = require('./initws');
const build = require('./build');
const optionsMerge = require('./utils/optionsmerge');
const optionsFilter = require('./utils/optionsfilter');
const optionsFormat = require('./utils/optionsformat');
const logFilter = require('./utils/logfilter');
const config = require('./../config/config.js');
const linker = require('solc/linker');
const net = require('net');
const pathExists = require('path-exists').sync;
const addresses = require('./addresses.js');
const paths = require('./paths.js');

// Path from this file to your project's root or from where you run your script.
const RELATIVE_PATH = path.relative(__dirname, config.projectRoot); // allows building and requiring built contracts to the correct directory paths

/**
 * Create an Ethereum object. Will need to use Ethereum.init() to connect to the Web3 RPC provider and use the Ethereun object methods
 */
function Ethereum() {
  this.web3; // Web3 object used by library
  this.gasAdjust = 0; // Deploy and exec gas estimate adjustments

  this.connectionType;

  /** Account index used for transactions */
  this.accountIndex = 0;

  /** Account to use for transactions */
  this.account;

  /** Default options */
  this.options = {
    /** Default transaction options */
    from: undefined,
    to: undefined,
    value: undefined,
    gas: 0,
    gasPrice: undefined,
    gasLimit: undefined,
    data: undefined,
    nonce: undefined,

    /** Default delib options*/
    accountIndex: undefined,
    maxGas: undefined
  };

  /** Paths to contract related folders */
  this.paths = paths;

  this.addresses = addresses;

  this._presetAdded = false;

  /**
   *
   * @param {string} rpcPath
   * @returns {Web3}
   */
  this.init = (rpcPath) => {
    if (this.connectionType === 'rpc') {
      return this.web3;
    } else if (this.web3) {
      this.web3.setProvider(new Web3.providers.HttpProvider(config.rpc.rpcPath));
      this.connectionType = 'rpc';
      return this.web3;
    } else {
      this.web3 = init(rpcPath);

      if (this._presetAdded === false) {
        this._addPresetAccounts();
        this._presetAdded = true;
      }

      this.connectionType = 'rpc';
      return this.web3;
    }
  };

  /**
   *
   * @param {string} ipcPath
   * @returns {Web3}
   */
  this.initIPC = (ipcPath) => {
    if (this.connectionType === 'ipc') {
      return this.web3;
    } else if (this.web3) {
      this.web3.setProvider(new Web3.providers.IpcProvider(config.ipc.ipcPath, net));
      this.connectionType = 'ipc';
      return this.web3;
    } else {
      this.web3 = initIPC(ipcPath);

      if (this._presetAdded === false) {
        this._addPresetAccounts();
        this._presetAdded = true;
      }

      this.connectionType = 'ipc';
      return this.web3;
    }
  };

  /**
   *
   * @param {string} wsPath
   * @returns {Web3}
   */
  this.initws = (wsPath) => {
    if (this.connectionType === 'ws') {
      return this.web3;

    } else if (this.web3) {
      this.web3.setProvider(new Web3.providers.WebsocketProvider(config.ws.wsPath));
      this.connectionType = 'ws';
      return this.web3;

    } else {
      this.web3 = initws(wsPath);

      if (this._presetAdded === false) {
        this._addPresetAccounts();
        this._presetAdded = true;
      }

      this.connectionType = 'ws';
      return this.web3;
    }
  };

  /**
   *
   */
  this.closeWSConnection = () => {
    this.web3.currentProvider.connection.close();
  };

  /**
   *
   * @param {string} privateKey
   * @returns {Object}
   */
  this.addAccount = (privateKeyOrMnemonic) => {
    try {
      let key;
      if (privateKeyOrMnemonic.indexOf(' ') === -1) {
        key = this.web3.eth.accounts.wallet.add(privateKeyOrMnemonic);
      } else {
        const wallet = ethers.Wallet.fromMnemonic(privateKeyOrMnemonic);
        const privateKey = wallet.privateKey;
        key = this.web3.eth.accounts.wallet.add(privateKey);
      }
      return key;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @returns {Array}
   */
  this.getAccounts = () => {
    return promisify(callback => {
      const allAccounts = [];
      this.web3.eth.getAccounts()
        .then(accounts1 => {
          for (let i = 0; i < accounts1.length; i++) {
            allAccounts.push(accounts1[i]);
          }
          const accounts2 = this.web3.eth.accounts.wallet;

          for (let i = 0; i < accounts2.length; i++) {
            allAccounts.push(accounts2[i].address);
          }

          callback(null, allAccounts)
        })
        .catch(err => {
          callback(err, null);
        })
    })();
  }

  /**
   * Change web3 provider.
   * @param {string} path
   * @param {string} type
   * @returns {Web3}
   */
  this.changeProvider = (type, path) => {
    if (this.web3) {
      if (type === 'rpc') {
        path = path || config.rpc.rpcPath;
        this.web3.setProvider(new Web3.providers.HttpProvider(path));
      } else if (type === 'ipc') {
        path = path || config.ipc.host;
        this.web3.setProvider(new Web3.providers.IpcProvider(path, net));
      } else if (type === 'ws') {
        path = path || config.ws.wsPath;
        this.web3.setProvider(new Web3.providers.WebsocketProvider(path));
      }
      return this.web3;
    }
  }

  /**
   * Builds Solidity contracts.
   * @param {array} contractFiles
   * @param {string} contractPath
   * @param {string} buildPath
   * @returns {Promise}
   */
  this.build = (contractFiles, contractPath, buildPath) => {
    contractPath = (contractPath) ? path.join(__dirname, RELATIVE_PATH, contractPath) : path.join(__dirname, RELATIVE_PATH, this.paths.contract);
    buildPath = (buildPath) ? path.join(__dirname, RELATIVE_PATH, buildPath) : path.join(__dirname, RELATIVE_PATH, this.paths.built);
    return build(contractFiles, contractPath, buildPath);
  };

  /**
   * Builds Solidity contracts.
   * @param {array} contractFiles
   * @param {string} contractPath
   * @param {string} buildPath
   * @returns {Promise}
   */
  this.compile = (contractFiles, contractPath, buildPath) => {
    contractPath = (contractPath) ? path.join(__dirname, RELATIVE_PATH, contractPath) : path.join(__dirname, RELATIVE_PATH, this.paths.contract);
    buildPath = (buildPath) ? path.join(__dirname, RELATIVE_PATH, buildPath) : path.join(__dirname, RELATIVE_PATH, this.paths.built);
    return build(contractFiles, contractPath, buildPath);
  };

  /**
   *
   * @param {string} contractName
   * @returns {Contract}
   */
  this._builtContractDeployment = (contractName) => {
    const builtPath = path.join(config.projectRoot, this.paths.built, contractName + '.json');
    if (!pathExists(builtPath)) {
      var e = new Error('  \'' + contractName + '\' is not a valid built contract at:', builtPath);
      throw e;
    }

    const contractJSONPath = path.resolve(path.join(config.projectRoot, this.paths.built, contractName + '.json'));

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

  this._builtContractExec = (contractName, address) => {
    const contractJSONPath = path.resolve(path.join(config.projectRoot, this.paths.built, contractName + '.json'));
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
    const contractJSONPath = path.resolve(path.join(config.projectRoot, this.paths.built, contractName + '.json'));

    let contractInfo;
    try {
      const contractJSONString = fs.readFileSync(contractJSONPath);
      contractInfo = JSON.parse(contractJSONString);
    } catch (e) {
      throw e;
    }
    return contractInfo;
  };

  this._getByteCode = (contractName) => {
    const contractJSONPath = path.resolve(path.join(config.projectRoot, this.paths.built, contractName + '.json'));
    const contractJSONString = fs.readFileSync(contractJSONPath);
    const contractInfo = JSON.parse(contractJSONString);
    return contractInfo.bytecode;
  }

  /**
   * Deploy a built contract.
   * @param {string or number} accountOrIndex
   * @return {Number}
   */
  this.balanceOf = (accountOrIndex) => {
    this._checkConnectionError();

    return promisify(callback => {
      this.getAccounts()
        .then(accounts => {
          let address
          if (!accountOrIndex) {
            address = this.account || accounts[this.accountIndex];
          } else {
            if (typeof(accountOrIndex) === 'number') {
              address = accounts[accountOrIndex];
            } else {
              address = accountOrIndex;
            }
          }
          return this.web3.eth.getBalance(address);
        })
        .then(res => {
          callback(null, res);
        })
        .catch(err => {
          callback(err, null);
        })
    })();
  }

  /**
   * Deploy a built contract.
   * @param {string} toAccount
   * @param {Number} value
   * @param {Object} options
   * @return {Object}
   */
  this.transfer = (toAccount, value, options) => {
    this._checkConnectionError();

    options = this._optionsUtil(this.options, options);

    return promisify(callback => {
      this.getAccounts()
        .then(accounts => {
          options.to = toAccount || options.to;
          options.value = value || options.value;
          options.from = options.from || accounts[options.accountIndex] || this.account || accounts[this.accountIndex];

          if (!options.gas) {
            this.web3.eth.estimateGas(options)
              .then(gasEstimate => {
                return this.web3.eth.sendTransaction(options);
              })
              .then(tx => {
                callback(null, tx);
              })
              .catch(err => {
                callback(err, null);
              })
          }

          return this.web3.eth.sendTransaction(options);
        })
        .then(tx => {
          callback(null, tx);
        })
        .catch(err => {
          callback(err, null);
        });
    })();
  }

  /**
   *
   * @return {Array}
   */
  this._addPresetAccounts = () => {
    if (config.accounts.length === 0) return;
    else {
      const privateKeyAndMnemonicArr = config.accounts;
      const keys = [];
      for (let i = 0; i < privateKeyAndMnemonicArr.length; i++) {
        const key = this.addAccount(privateKeyAndMnemonicArr[i]);
        keys.push(key);
      }
      return keys;
    }
  }

  /**
   * Creates an Ethereum account and returns the public address and private key of the account
   * @param {string} entropy
   * @return {Object}
   */
  this.createAccount = (entropy) => {
    return promisify(callback => {
      let account;
      this.getAccounts()
        .then(accounts => {
          return this.web3.eth.accounts.create(entropy);
        })
        .then(createdAccount => {
          account = createdAccount;
          return this.addAccount(account.privateKey);
        })
        .then(key => {
          callback(null, account);
        })
        .catch(err => {
          callback(err, null);
        });
    })();

  }

  /**
   * Deploy a built contract.
   * @param {string} contractName
   * @param {Array} args
   * @param {Object} options
   * @param {Array} links
   * @return {Promise}
   */
  this.deploy = (contractName, args, options, links) => {
    this._checkConnectionError();

    const builtPath = path.join(config.projectRoot, this.paths.built, contractName + '.json');
    if (!pathExists(builtPath)) {
      var e = new Error(contractName + ' is not a valid built contract at: ' + builtPath);
      throw e;
    }

    if (args === undefined) args = [];
    args = Array.isArray(args) ? args : [args];

    options = this._optionsUtil(this.options, options);
    const contract = this._builtContractDeployment(contractName);
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
        promisify(self.getAccounts)()
          .then(accounts => {
            deployOptions.from = deployOptions.from || accounts[deployOptions.accountIndex] || self.account || accounts[self.accountIndex];
            let byteCode = self._getByteCode(contractName);
            if (links) {
              byteCode = linker.linkBytecode(byteCode, links);
            }

            const data = contract.deploy({data: byteCode, arguments: args}).encodeABI(deployOptions);

            const transactionOptions = {
              from: deployOptions.from,
              gas: deployOptions.gas,
              data: data,
              value: deployOptions.value
            };
            return self.web3.eth.sendTransaction(transactionOptions);
          })
          .then(tx => {
            const contractJSONPath = path.resolve(path.join(config.projectRoot, self.paths.built, contractName + '.json'));
            const contractJSONString = fs.readFileSync(contractJSONPath);
            const contractInfo = JSON.parse(contractJSONString);

            const contractInstance = new self.web3.eth.Contract(contractInfo.abi, tx.contractAddress);
            self.addresses.set(contractName, tx.contractAddress, links);
            const contractInstanceWithMethods = self.execAt(contractName, tx.contractAddress);
            contractInstanceWithMethods.blockCreated = tx.blockNumber;
            contractInstanceWithMethods.from = tx.from;
            callback(null, contractInstanceWithMethods);
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

    const builtPath = path.join(config.projectRoot, this.paths.built, contractName + '.json');
    if (!pathExists(builtPath)) {
      var e = new Error(contractName + ' is not a valid built contract at: ' + builtPath);
      throw e;
    }

    if (args === undefined) args = [];
    args = Array.isArray(args) ? args : [args];
    options = this._optionsUtil(this.options, options);
    const contract = this._builtContractDeployment(contractName);
    return promisify(callback => {
      promisify(this.getAccounts)()
        .then(accounts => {
          options.from = options.from || accounts[options.accountIndex] || this.account || accounts[this.accountIndex];
          const transactionOptions = Object.assign({}, options);
          transactionOptions.gas = undefined;
          const contractInfo = this.getContractInfo(contractName);
          let byteCode = this._getByteCode(contractName);

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
  };

  /**
   * Calls a deployed contract
   * @param {string} contractName
   * @return {Contract}
   */
  this.exec = (contractName) => {
    const builtPath = path.join(config.projectRoot, this.paths.built, contractName + '.json');
    if (!pathExists(builtPath)) {
      var e = new Error(contractName + ' is not a valid built contract at: ' + builtPath);
      throw e;
    }

    const contractAddress = this.addresses.get(contractName).address;
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

    const builtPath = path.join(config.projectRoot, this.paths.built, contractName + '.json');
    if (!pathExists(builtPath)) {
      var e = new Error('  \'' + contractName + '\' is not a valid built contract at:', builtPath);
      throw e;
    }

    const contract = this._builtContractExec(contractName, contractAddress);
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

            promisify(this.getAccounts)()
              .then(accounts => {
                options.from = options.from || accounts[options.accountIndex] || this.account || accounts[this.accountIndex];
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

            promisify(this.getAccounts)()
              .then(accounts => {
                options.from = options.from || accounts[options.accountIndex] || this.account || accounts[this.accountIndex];
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
              promisify(this.getAccounts)()
                .then(accounts => {
                  options.from = options.from || accounts[options.accountIndex] || this.account || accounts[this.accountIndex];

                  const data = contract.methods[methodName](...args).encodeABI();
                  const transactionOptions = {
                    from: options.from,
                    to: contractAddress,
                    gas: options.gas,
                    value: options.value,
                    data: data,
                    gasLimit: options.gasLimit
                  };

                  return this.web3.eth.sendTransaction(transactionOptions);
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
            promisify(this.getAccounts)()
              .then(accounts => {
                options.from = options.from || accounts[options.accountIndex] || this.account || accounts[this.accountIndex];
                options.gas = undefined;

                // Throw error if est gas is greater than max gas
                if (options.maxGas && options.gas > options.maxGas) {
                  throw new Error('Gas estimate of ' + options.gas + ' is greater than max gas allowed ' + options.maxGas);
                }

                return contract.methods[methodName](...args).estimateGas(options);
              })
              .then(gasEstimate => {
                const data = contract.methods[methodName](...args).encodeABI();
                const transactionOptions = {
                  from: options.from,
                  to: contractAddress,
                  gas: gasEstimate,
                  value: options.value,
                  data: data,
                  gasLimit: options.gasLimit
                };
                // return contract.methods[methodName](...args).send(options);

                return this.web3.eth.sendTransaction(transactionOptions);
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

    mockContract.address = contractAddress;

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
  this.events = (contractName, eventName, blockOptions, filter) => {
    const builtPath = path.join(config.projectRoot, this.paths.built, contractName + '.json');
    if (!pathExists(builtPath)) {
      var e = new Error(contractName + ' is not a valid built contract at: ' + builtPath);
      throw e;
    }

    const contractAddress = this.addresses.get(contractName).address;
    return this.eventsAt(contractName, contractAddress, eventName, blockOptions, filter);
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
  this.eventsAt = (contractName, contractAddress, eventName, blockOptions, filter) => {
    this._checkConnectionError();

    const builtPath = path.join(config.projectRoot, this.paths.built, contractName + '.json');
    if (!pathExists(builtPath)) {
      var e = new Error('  \'' + contractName + '\' is not a valid built contract at:', builtPath);
      throw e;
    }

    const contract = this._builtContractExec(contractName, contractAddress);

    // Check to see if valid event
    if (eventName !== 'allEvents' && (typeof contract.events[eventName] !== 'function' ||
      contract.events[eventName].hasOwnProperty('call'))) {
      throw new Error('Invalid event: ' + eventName + ' is not an event of ' + contractName);
    }

    return promisify(callback => {
      promisify(this.web3.eth.getBlock)('latest')
        .then(block => {
          blockOptions = blockOptions ? blockOptions : {};
          blockOptions = (blockOptions && typeof blockOptions === 'object') ? blockOptions : {};

          blockOptions.fromBlock = blockOptions.fromBlock ? blockOptions.fromBlock : 0;
          blockOptions.toBlock = blockOptions.toBlock ? blockOptions.toBlock : 'latest';

          const eventFilter = blockOptions;
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
   * @param {Object} options
   * @param {Function} callback
   * @returns
   */
  this.watch = (contractName, eventName, options, callback) => {
    const builtPath = path.join(config.projectRoot, this.paths.built, contractName + '.json');
    if (!pathExists(builtPath)) {
      var e = new Error(contractName + ' is not a valid built contract at: ' + builtPath);
      throw e;
    }

    const contractAddress = this.addresses.get(contractName).address;
    return this.watchAt(contractName, contractAddress, eventName, options, callback);
  };

  /**
   * Watch an event at a specific address
   * @param {string} contractName
   * @param {string} contractAddress
   * @param {string} eventName
   * @param {Object} options - Optional. Can replace with callback
   * @param {Function} callback
   * @returns
   */
  this.watchAt = (contractName, contractAddress, eventName, options, callback) => {
    this._checkConnectionError();

    // Allow no filter to be passed in
    if (typeof options === 'function' && !callback) {
      callback = options;
    }

    const contract = this._builtContractExec(contractName, contractAddress);

    // Check to see if valid event
    if (eventName !== 'allEvents' && (typeof contract.events[eventName] !== 'function' ||
    contract.events[eventName].hasOwnProperty('call'))) {
      throw new Error('Invalid event: ' + eventName + ' is not an event of ' + contractName);
    }

    options = (options && typeof options === 'object') ? options : {};
    options.address = options.hasOwnProperty('address') ? options.address : contractAddress;

    let watchEvents;

    this.web3.eth.getBlockNumber()
      .then(blockNumber => {
        blockNumber = options.blockNumber ? options.blockNumber : blockNumber;
        watchEvents = contract.events[eventName]({options: options, fromBlock: blockNumber});
        watchEvents
          .on("data", (event) => {
            callback(null, event);
          })
          .on("error", (err) => {
            callback(err, null);
          })
      })
      .catch(err => {
        throw err;
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
    if (!this.connectionType) {
      throw new Error ('Not connected to any provider');
    }
    type = type || this.connectionType;
    type = type.toLowerCase();
  };

  /**
   * Check the status of a certain connection type and throws error if not connected
   * @param {string} type - The connection type to test the status of. 'rpc', 'ipc'. Defaults to the current provider type.
   */
  this.closeConnection = (type) => {
    if (!this.connectionType) {
      throw new Error ('Not connected to any provider');
    }
    type = type || this.connectionType;
    type = type.toLowerCase();
  };



}
module.exports = new Ethereum();
