/* global web3 */
(function devchain() {
  var initialBlockNumber = web3.eth.blockNumber;
  var blockNumber = web3.eth.blockNumber; // the block number to keep mining too
  var isAccountInfoDisplayed = false;

  // make 5 accounts initially
  while (web3.eth.accounts.length < 5) {
    web3.personal.newAccount('');
    web3.personal.unlockAccount(web3.eth.accounts[web3.eth.accounts.length - 1], '', 10000000);
  }

  // unlocks all accounts
  for (var i = 0; i < web3.eth.accounts.length; i++) {
    web3.personal.unlockAccount(web3.eth.accounts[i], '', 10000000);
  }

  // give 5 accounts 10 ether if they have less than 5
  for (i = 0; i < 5; i++) {
    if (web3.eth.getBalance(web3.eth.accounts[i]).lessThan(etherToWei(5)) && web3.eth.getBalance(web3.eth.coinbase).greaterThan(etherToWei(51))) {
      var object = {
        from: web3.eth.coinbase,
        to: web3.eth.accounts[i],
        value: etherToWei(10)
      };
      web3.eth.sendTransaction(object);
    }
  }
  // to allow for continous checking of status
  web3.eth.filter('latest', checkStatus);
  web3.eth.filter('pending', checkStatus);

  checkStatus();

  function etherToWei(amount) {
    return web3.toWei(web3.toBigNumber(amount), 'ether');
  }

  function weiToEther(amount) {
    return web3.fromWei(web3.toBigNumber(amount), 'ether');
  }

  function startMining() {
    if (!web3.eth.mining) {
      console.log('');
      console.log('[DeLib] Starting miner');
      console.log('');
      web3.miner.start(1);
    }
  }

  function stopMining() {
    if (web3.eth.mining) {
      console.log('');
      console.log('[DeLib] Stopping miner');
      console.log('');
      web3.miner.stop();
    }
  }
  function checkStatus() {
    if (web3.eth.blockNumber == initialBlockNumber) {
      startMining();
    }

    // Display accounts info after send transactions are verified
    if (!isAccountInfoDisplayed && web3.eth.blockNumber > initialBlockNumber) {
      isAccountInfoDisplayed = true;
      displayAccountsInfo();
    }

    if (web3.eth.getBalance(web3.eth.coinbase).lessThan(etherToWei(100))) {
      startMining();
      return;
    }

    if (web3.eth.getBlock('pending').transactions.length > 0) {
      blockNumber = web3.eth.blockNumber + 5;
      startMining();
      return;
    }

    if (web3.eth.blockNumber > blockNumber) {
      stopMining();
      return;
    }
  }

  function displayAccountsInfo() {
    console.log('');
    console.log('[DeLib] Delib Development Blockchain');
    console.log('');
    console.log('[DeLib] Accounts                                      Balances');
    for (i = 0; i < web3.eth.accounts.length; i++) {
      console.log('[DeLib]', web3.eth.accounts[i], '  ', weiToEther(web3.eth.getBalance(web3.eth.accounts[i])));
    }
    console.log('');
  }
}());
