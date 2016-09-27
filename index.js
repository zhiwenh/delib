const Ethereum = require('./src/ethereum/ethereum.js');
const IPFS = require('./src/ipfs/ipfs.js');

module.exports = {
  eth: Ethereum,
  ipfs: IPFS
};
