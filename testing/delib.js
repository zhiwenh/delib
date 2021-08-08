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
  },

  solc: {
    version: '0.8.4'
  },

  accounts: [
    'adult cool base able ensure circle inform else fan abandon shop warrior van beef enough',
    'outdoor envelope exhibit angry sweet lawn tobacco extend album network power ostrich palm argue clever',
    '57e56473f9f7596dbf7a2ad3673c452baf5aa4fe21a0d09446efd9ad84cc5c2e'
  ]
};
