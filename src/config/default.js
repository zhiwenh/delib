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
    host: 'localhost',
    port: 8545
  },

  /** IPC connection options */
  ipc: {
    host: null // Relative path to IPC host
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
  }
};
