/** Config file for devchain. This file is not required to use devchain */
module.exports = {

  /** Preload script options */
  autoMine: true, // Set false to turn off auto mining
  isMute: false, // Set true to turn off transaction receipt display
  accountAmount: 5, // Number of accounts to create
  password: '', // Password to create accounts with
  minAmount: 150, // Ether amount to keep coinbank topped off at
  distributeAmount: 20, // Ether amount to distribute to all accounts

  /** Custom geth node start options */
  rpcaddr: 'localhost', // RPC address
  rpcport: 8546, // RPC port
  port: 30304, // P2P network listening port
  networkid: 1, // Network identifier. To connect with other nodes
  staticNodes: [], // Geth enode addresses to connect with
};
