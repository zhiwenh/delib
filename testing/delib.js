/**********************************/
/** TESTS CONFIGURATION *?
/**********************************/

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

  ws: {
    wsPath: 'ws://localhost:8545'
  }
};
