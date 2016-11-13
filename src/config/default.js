/** Configuration options for delib */

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
    port: 8545,
  },

  /** IPC connection options */
  ipc: {
    host: null // Relative path to IPC host
  },

  /** CLI options */
  cli: {
    /** Default transaction options */
    options: {
      from: 0, // Account index
      value: 0,
      gas: 0 // Set at 0 to estimate gas value
    }
  }
};
