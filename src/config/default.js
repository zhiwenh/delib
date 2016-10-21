
/** Configuration options for DeLib */

module.exports = {
  /** Development mode status. If true it sets up IPC host to the development blockchain path*/
  dev: true,

  /** Solidity, build, and address paths of contracts */
  contracts: {
    path: './contracts/',
    built: './built/',
    address: './addresses/'
  },

  /** Transaction options for CLI */
  cli: {
    options: {
      from: 0, // Ethereum account index
      value: 0,
      gas: 3000000
    }
  },

  /** RPC connection options to geth node */
  rpc: {
    host: 'localhost',
    port: 8545,
  },

  /** Blockchain options */
  blockchain: {
    /** Blockchain paths. IPC host connection is based off these paths  */
    path: {
      dev: './devchain/', // Development blockchain path. Initialized with CLI command devchain
      production: process.env.HOME + '/Library/Ethereum/'
    },

    /** DeLib development chain options */
    /** Preload script options */
    auto: true, // Status of toggling mining if there are transactions pending and whether to keep coinbank topped off at minAmount
    accountAmount: 5, // Number of accounts to generate in devchain
    password: '', // Password to create accounts with
    minAmount: 100, // Amount for coinbank to mine to
    distributeAmount: 10, // Ether amount to distribute to accounts

    /** Geth node spawn arguments */
    identity: 'delib',
    rpcport: 8545,
    port: 30303, // Network listening port. Allows connection to other nodes
    // Addresses of the nodes to connect to. If nodes have same genesis file configurations and identities then the devchain to sync with them.
    staticNodes: [
      // ex: "enode://f4642fa65af50cfdea8fa7414a5def7bb7991478b768e296f5e4a54e8b995de102e0ceae2e826f293c481b5325f89be6d207b003382e18a8ecba66fbaf6416c0@33.4.2.1:30303"
      // ex: "enode://pubkey@ip:port"
    ]
  }
};
