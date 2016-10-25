
/** Configuration options for DeLib */

/** Make sure not to remove any of the options */

module.exports = {
  /** Development mode status. If true it sets up IPC host to the development blockchain path */
  dev: true,

  /** Contract file paths */
  contracts: {
    path: './contracts/', // Path to Solidity contracts
    built: './built/', // Path to built contracts
    address: './addresses/' // Path to deployed contract addresses
  },

  /** Transaction options for CLI. */
  /** If you want to change the options then you will need to re-save this file for each CLI transaction */
  cli: {
    options: {
      from: 0, // Account index
      value: 0,
      gas: 1000000
    }
  },

  /** The RPC connection options that the library and CLI will use to connect to a geth node */
  rpc: {
    host: 'localhost',
    port: 8545,
  },

  blockchain: {
    /** IPC host connection is based off these paths */
    path: {
      dev: './devchain/', // Development blockchain path
      production: process.env.HOME + '/Library/Ethereum/' // Path used if dev is set to false. This is the directory that geth uses for the actual Ethereum blockchain on Mac OSX
    },

    /** Development blockchain options */
    autoMine: true, // Status of toggling mining if there are transactions pending and whether to keep coinbank topped off at a minimum amount
    accountAmount: 3, // Number of accounts to create
    password: '', // Password to create accounts with
    minAmount: 50, // Amount for coinbank to mine to
    distributeAmount: 10, // Ether amount to distribute to accounts after mining

    /** Geth node start arguments */
    identity: 'delib', // RPC identity name
    rpcaddr: 'localhost', // RPC host
    rpcport: 8545, // RPC port to open for web3 calls
    port: 30303, // Geth p2p network listening port. Allows other nodes to connect

    /** Addresses of nodes to connect to */
    staticNodes: [
      // If the nodes have same genesis file and identities as yours then syncing will begin. Example enodes:
      // "enode://f4642fa65af50cfdea8fa7414a5def7bb7991478b768e296f5e4a54e8b995de102e0ceae2e826f293c481b5325f89be6d207b003382e18a8ecba66fbaf6416c0@33.4.2.1:30303", "enode://pubkey@ip:port"
    ]
  }
};
