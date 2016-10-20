
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
    auto: true, // Status of toggling mining if there are transactions pending and whether to keep coinbank topped off at minAmount
    accountAmount: 5, // Number of accounts to generate in devchain
    distributeAmount: 10, // Ether amount to distribute to accounts
    minAmount: 100, // Amount for coinbank to mine to
  },

  /* IPFS network provider options */
  ipfs: {
    host: 'localhost',
    port: 5001,
    protocol: 'http'
  }
};
