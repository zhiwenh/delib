/* global web3, CONFIG */

(function () {
  // amount of Ether for coinbank to always have
  var minAmount = CONFIG.minAmount;
  // amount of accounts to create
  var accountAmount = CONFIG.accountAmount;
  // amount of Ether to distribute to accounts
  var distributeAmount = CONFIG.distributeAmount;
  // amount of Ether needed by coinbank
  var requiredEtherAmount = distributeAmount * accountAmount + 1;
  // Status of toggling mining if there are transactions pending and whether to keep coinbank topped off at minAmount
  var auto = CONFIG.auto;


  var initialBlockNumber = web3.eth.blockNumber;
  var blockNumber = web3.eth.blockNumber; // the block number to keep mining too
  var isAccountInfoDisplayed = false;

  // make 5 accounts initially
  console.log('');
  console.log('[DeLib] Creating/Unlocking accounts');
  console.log('');
  while (web3.eth.accounts.length < accountAmount) {
    web3.personal.newAccount('');
    web3.personal.unlockAccount(web3.eth.accounts[web3.eth.accounts.length - 1], '', 10000000);
  }

  // unlocks all accounts
  for (var i = 0; i < web3.eth.accounts.length; i++) {
    web3.personal.unlockAccount(web3.eth.accounts[i], '', 10000000);
  }

  distributeEther();

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
    if (web3.eth.blockNumber === initialBlockNumber) {
      startMining();
    }

    if (auto === true) {
      // Display accounts info after send transactions are verified
      if (!isAccountInfoDisplayed && web3.eth.blockNumber > initialBlockNumber) {
        isAccountInfoDisplayed = true;
        displayAccountsInfo();
      }

      if  (web3.eth.getBalance(web3.eth.coinbase).lessThan(etherToWei(minAmount))) {
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
    } else {
      if (!isAccountInfoDisplayed && web3.eth.blockNumber > initialBlockNumber) {
        isAccountInfoDisplayed = true;
        displayAccountsInfo();
        stopMining();
      }
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

  // Distribute ether to other accounts
  function distributeEther() {
    if (web3.eth.getBalance(web3.eth.coinbase).greaterThan(etherToWei(requiredEtherAmount))) {
      for (i = 0; i < accountAmount; i++) {
        if (web3.eth.getBalance(web3.eth.accounts[i]).lessThan(etherToWei(distributeAmount))) {
          var object = {
            from: web3.eth.coinbase,
            to: web3.eth.accounts[i],
            value: etherToWei(10)
          };
          web3.eth.sendTransaction(object);
        }
      }
    }

  }
})();
