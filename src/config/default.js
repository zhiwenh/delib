/** Configuration options for Delib */

module.exports = {
  /** Project file paths */
  paths: {
    contract: './contracts', // Relative path to Solidity contracts
    built: './built', // Relative path to built contracts
    address: './addresses' // Relative path to deployed contract addresses
  },

  /** RPC connection options */
  rpc: {
    rpcPath: 'http://localhost:8545'
  },

  /** IPC connection options */
  ipc: {
    host: null // Relative path to IPC host
  },

  /** WS connection options */
  ws: {
    wsPath: 'ws://localhost:8545'
  },

  /** CLI options */
  cli: {
    /** Default transaction options */
    options: {
      account: 0, // Account index to use for transactions
      from: null,  // Replaces account index
      value: null, // Value in wei
      gas: null, // Estimated if not specified
      gasprice: null, // Mean network gas price if not specified
      maxgas: null // Max gas allowed when estimating
    }
  },

  /** solc options. Supported versions: 0.4.1 - 0.8.6 **/
  solc: {
    version: '0.8.6'
  }
};
