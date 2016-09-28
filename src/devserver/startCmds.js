/* global web3 */
(function devserver() {
  // web3.miner.setEtherbase('0x0000000000000000000000000000000000000000');
  if (web3.eth.accounts.length === 0) {
    web3.personal.newAccount('');
  } else {
    web3.personal.unlockAccount(web3.eth.accounts[0], '', 10000000);
  }
  // web3.personal.newAccount('');
  // web3.eth.accounts;
  // web3.eth.sendTransaction({
  //   from: web3.eth.coinbase,
  //   to: web3.eth.accounts[0],
  //   value: 100000000000000000000,
  //   gas: 1000000
  // });
}());
