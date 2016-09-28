module.exports = {
  /* Development mode status */
  dev: true,

  /* Solidity, build, and address paths of contracts */
  contracts: {
    path: './contracts/',
    built: './contracts/',
    address: './contracts/'
  },

  /* RPC connection options to geth node */
  rpc: {
    host: 'localhost',
    port: 8545,
  },

  /* devsever location options */
  blockchain: {
    path: {
      dev: './devblockchain/',
      production: process.env.HOME + '/Library/Ethereum/'
    },
    difficulty: null
  },

  /* IPFS network provider options */
  ipfs: {
    host: 'localhost',
    port: 5001,
    protocol: 'http'
  },

  /* Transaction options for CLI */
  cli: {
    options: {
      from: 0,
      value: 0,
      gas: 3000000
    }
  }
};
