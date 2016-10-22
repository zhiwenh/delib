
/** Configuration options for DeLib */

/** Make sure not to remove any of the options */

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
      value: 0, // In wei
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

    /** Development blockchain options */

    /** Preload script */
    /** Status of toggling mining if there are transactions pending and whether to keep coinbank topped off at minAmount */
    autoMine: true,
    /** Number of accounts to generate in devchain */
    accountAmount: 3,
    /** Password to create accounts with */
    password: '',
    /** Amount for coinbank to mine to */
    minAmount: 50,
    /** Ether amount to distribute to accounts after mining. */
    distributeAmount: 10,

    /** Geth node spawn arguments */
    identity: 'delib',
    /** RPC port to open for web3 calls */
    rpcport: 8545,
    /** Geth network listening port. Allows other nodes to connect */
    port: 30303,

    /** Addresses of the nodes to connect to. If nodes have same genesis file and identities then the devchain can sync with them. */
    staticNodes: [
      // ex: "enode://f4642fa65af50cfdea8fa7414a5def7bb7991478b768e296f5e4a54e8b995de102e0ceae2e826f293c481b5325f89be6d207b003382e18a8ecba66fbaf6416c0@33.4.2.1:30303", "enode://pubkey@ip:port"
    ]
  }
};
