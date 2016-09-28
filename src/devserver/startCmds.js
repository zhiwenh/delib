/* global web3 */
(function devserver() {
  miner.setEtherbase('0x0000000000000000000000000000000000000000');
  web3.eth.coinbase = '0x0000000000000000000000000000000000000000';
  // web3.miner.start();
}());
