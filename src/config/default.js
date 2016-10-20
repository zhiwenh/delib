
/** Configuration options for DeLib */

module.exports = {
  /* Transaction options for CLI */
  cli: {
    options: {
      from: 0, // Ethereum account index
      value: 0,
      gas: 3000000
    }
  },

  /* Development mode status */
  dev: true,

  /* Solidity, build, and address paths of contracts */
  contracts: {
    path: './contracts/',
    built: './built/',
    address: './addresses/'
  },

  /* RPC connection options to geth node */
  rpc: {
    host: 'localhost',
    port: 8545,
  },

  /* Blockchain location options */
  blockchain: {
    path: {
      dev: './devchain/', // Development blockchain. Initialized with CLI command devchain
      production: process.env.HOME + '/Library/Ethereum/'
    },
    difficulty: null
  },

  /* IPFS network provider options */
  ipfs: {
    host: 'localhost',
    port: 5001,
    protocol: 'http'
  }
};
