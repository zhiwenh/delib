module.exports = {
  dev: true,
  contracts: {
    path: './contracts/',
    built: './contracts/',
    address: './contracts/'
  },
  rpc: {
    host: 'localhost',
    port: 8545,
  },
  ipc: {
    dev: process.env.HOME + '/Library/Ethereum/private/geth.ipc',
    production: process.env.HOME + '/Library/Ethereum/geth.ipc'
  },
  ipfs: {
    host: 'localhost',
    port: 5001,
    protocol: 'http'
  },
  cli: {
    options: {
      from: 0,
      value: 0,
      gas: 3000000
    }
  }
};
