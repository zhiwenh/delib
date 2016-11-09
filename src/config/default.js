/** Configuration options for DeLib */

module.exports = {
  /** Contract file paths */
  contracts: {
    path: './contracts/', // Relative path to Solidity contracts
    built: './built/', // Relative path to built contracts
    address: './addresses/' // Relative path to deployed contract addresses
  },

  /** RPC connection options */
  rpc: {
    host: 'localhost',
    port: 8545,
  },

  /** The IPC host path. If null it will be devchain.path */
  ipc: {
    host: null
  },

  /** Devchain options */
  devchain: {
    path: './devchain/', // Relative path to devchain data

    autoMine: true, // Auto mining status
    accountAmount: 3, // Number of accounts to create
    password: '', // Password to create accounts with
    minAmount: 50, // Ether amount to keep coinbank topped off at
    distributeAmount: 10, // Ether amount to distribute to all accounts

    /** Custom geth node start options */
    identity: 'delib', // RPC identity name
    rpcaddr: 'localhost', // RPC host
    rpcport: 8545, // RPC port
    port: 30303, // Geth p2p network listening port
    staticNodes: [] // Geth enode addresses to connect with
  },

  /** Default transaction options for CLI. */
  cli: {
    options: {
      from: 0, // Account index
      value: 0,
      gas: 0 // Set at 0 to estimate gas value
    }
  }
};
