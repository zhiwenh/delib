var CONFIG = {"path":{"dev":"/Users/zhiwen/Development/DeStore-main/delib-test/devchain/","production":"/Users/zhiwen/Library/Ethereum/"},"auto":true,"accountAmount":5,"password":"","minAmount":100,"distributeAmount":10,"identity":"delib","rpcport":8545,"port":30303,"staticNodes":[]}; 
/* global web3, CONFIG */

(function () {
  // amount of Ether for coinbank to always have
  var minAmount = CONFIG.minAmount;
  // amount of accounts to create
  var accountAmount = (CONFIG.accountAmount > 0) ? CONFIG.accountAmount : 1;
  // amount of Ether to distribute to accounts
  var distributeAmount = CONFIG.distributeAmount;
  // amount of Ether needed by coinbank
  var requiredEtherAmount = distributeAmount * accountAmount + 2;
  // Status of toggling mining if there are transactions pending and whether to keep coinbank topped off at minAmount
  var auto = CONFIG.auto; // automining status
  var password = CONFIG.password; // password for the accounts created
  var blockNumber = web3.eth.blockNumber; // the block number to keep mining too

  var distributeBlock; // block number when distributed for reference
  var isBalanceDisplayed = false;
  var isDistributed = distributeAmount === 0 ? true : false; // status of ether distribution


  var transactions = []; // to contain pending transaction hashes of a block

  console.log('');
  console.log('[DeLib] DeLib Development Blockchain');
  console.log('');
  console.log('[DeLib] Node address:', web3.admin.nodeInfo.enode);
  console.log('');
  if (auto === true) {
    console.log('[DeLib] Auto On');
    console.log('[DeLib] Coinbase will be remain above', minAmount, 'Ether');
    console.log('[DeLib] Mining will start automatically when there are transactions pending');
  } else {
    console.log('[DeLib] Auto Off');
    console.log('[DeLib] To start mining call miner.start(1)');
    console.log('[DeLib] To stop mining call miner.stop(1)');
  }

  if (distributeAmount !== 0) {
    console.log('');
    console.log('[DeLib] Distributing', distributeAmount, 'to accounts when coinbase has', requiredEtherAmount, 'Ether');
  }

  createAccounts();

  // to allow for continous checking of status
  web3.eth.filter('latest', checkStatus);
  web3.eth.filter('pending', checkStatus);

  if (auto === true) startMining();

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
    // For distributing Ether to accounts and displaying it
    if (isBalanceDisplayed === false && distributeBlock + 2 === web3.eth.blockNumber) {
      displayAccountsBalance();
      isBalanceDisplayed = true;
    }
    if (isDistributed === false) {
      distributeEther();
      blockNumber = web3.eth.blockNumber + 5;
    }

    // Display the transaction receipt of previous blocks
    if (transactions.length > 0) {
      for (var i = 0; i < transactions.length; i++) {
        var transactionHash = transactions[i];
        var transactionObj = web3.eth.getTransactionReceipt(transactionHash);
        displayTransactionReceipt(transactionObj);
      }
      transactions = [];
    }

    // Auto mining actions
    if (auto === true) {
      if (web3.eth.getBlock('pending').transactions.length > 0) {
        transactions = web3.eth.getBlock('pending').transactions;
        blockNumber = web3.eth.blockNumber + 5;
        startMining();
        return;
      }

      if (web3.eth.getBalance(web3.eth.coinbase).lessThan(etherToWei(minAmount))) {
        startMining();
        return;
      }

      if (web3.eth.blockNumber > blockNumber) {
        stopMining();
        return;
      }
    } else {
      if (web3.eth.getBlock('pending').transactions.length > 0) {
        transactions = web3.eth.getBlock('pending').transactions;
      }
    }
  }


  function createAccounts() {
    console.log('');
    console.log('[DeLib] Creating ' + accountAmount + ' accounts with password ' + '"' + password + '"');
    for (var i = 0; i < accountAmount; i++) {
      web3.personal.newAccount(password);
      web3.personal.unlockAccount(web3.eth.accounts[web3.eth.accounts.length - 1], password, 10000000);
      console.log('[DeLib]', web3.eth.accounts[i]);
    }
    console.log('');
  }

  function displayAccountsBalance() {
    console.log('');
    console.log('[DeLib]',  distributeAmount, 'Ether distributed to accounts');
    console.log('[DeLib] Accounts                                      Balances');
    for (var i = 0; i < web3.eth.accounts.length; i++) {
      console.log('[DeLib]', web3.eth.accounts[i], '  ', weiToEther(web3.eth.getBalance(web3.eth.accounts[i])));
    }
    console.log('');
  }

  function displayTransactionReceipt(transactionObj) {
    console.log('');
    console.log('[DeLib] Transaction Receipt');
    console.log('[DeLib] Block:    ', transactionObj.blockNumber);
    console.log('[DeLib] Hash:     ', transactionObj.transactionHash);
    console.log('[DeLib] From:     ', transactionObj.from);
    console.log('[DeLib] To:       ', transactionObj.to);
    console.log('[DeLib] Gas Used: ', transactionObj.gasUsed);
    console.log('[DeLib] Total Gas:', transactionObj.cumulativeGasUsed);
    console.log('[DeLib] Contract: ', transactionObj.contractAddress);
    console.log('');
  }
  // Distribute ether to other accounts
  function distributeEther() {
    if (web3.eth.getBalance(web3.eth.coinbase).greaterThan(etherToWei(requiredEtherAmount))) {
      for (var i = 0; i < accountAmount; i++) {
        if (web3.eth.getBalance(web3.eth.accounts[i]).lessThan(etherToWei(distributeAmount))) {
          var object = {
            from: web3.eth.coinbase,
            to: web3.eth.accounts[i],
            value: etherToWei(distributeAmount)
          };
          web3.eth.sendTransaction(object);
        }
      }
      distributeBlock = web3.eth.blockNumber;
      isDistributed = true;
    }
  }

  function etherToWei(amount) {
    return web3.toWei(web3.toBigNumber(amount), 'ether');
  }

  function weiToEther(amount) {
    return web3.fromWei(web3.toBigNumber(amount), 'ether');
  }
})();
