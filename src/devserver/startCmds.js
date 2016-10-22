/* global web3, CONFIG */

/** The global delib methods */
var delib = CONFIG; // CONFIG object gets built onto this file

/** DeLib console log */
delib.log = function() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift('[delib]');
  args.concat(arguments);
  console.log.apply(this, args);
};

/** To start mining */
delib.start = function() {
  if (!web3.eth.mining) {
    console.log('');
    delib.log('Starting miner');
    console.log('');
    web3.miner.start(1);
  }
};

/** To stop mining */
delib.stop = function() {
  if (web3.eth.mining) {
    console.log('');
    delib.log('Stopping miner');
    console.log('');
    web3.miner.stop();
  }
};

/** Toggles auto mining */
delib.auto = function() {
  if (this.autoMine === true) {
    this.autoMine = false;
    console.log('');
    this.log('Auto mining is off');
    console.log('');
  } else {
    this.autoMine = true;
    console.log('');
    this.log('Auto mining is on');
    console.log('');
  }
  this.stop();
};

/** Displays all accounts and balance info */
delib.accounts = function() {
  console.log('');
  this.log('Accounts');
  this.log('Index Account                                       Ether');
  for (var i = 0; i < web3.eth.accounts.length; i++) {
    if (web3.eth.accounts[i] === web3.eth.coinbase) {
      delib.log(i, '   ', web3.eth.accounts[i], '  ', this.weiToEther(web3.eth.getBalance(web3.eth.accounts[i])), '    - coinbase');
    } else {
      delib.log(i, '   ', web3.eth.accounts[i], '  ', this.weiToEther(web3.eth.getBalance(web3.eth.accounts[i])));
    }
  }
  console.log('');
};

/**
 * Distributes Ether to all of your accounts from an account
 * @param {number} fromIndex - Index in web3.eth.accounts to sender Ether from
 * @param {number} amount - Amount to transfer to all accounts
 */
delib.distribute = function(fromIndex, amount) {
  var requiredAmount = amount * (web3.eth.accounts.length - 1) + 2;
  if (web3.eth.getBalance(web3.eth.accounts[fromIndex]).greaterThan(this.etherToWei(requiredAmount))) {
    for (var i = 0; i < web3.eth.accounts.length; i++) {
      if (i === fromIndex) continue;
      var object = {
        from: web3.eth.accounts[fromIndex],
        to: web3.eth.accounts[i],
        value: this.etherToWei(amount)
      };
      web3.eth.sendTransaction(object);
    }
    console.log('');
    this.log(amount, 'Ether distributed to accounts');
    console.log('');
    this.mine(1);
  } else {
    var balanceEther = this.etherToWei(web3.eth.getBalance(web3.eth.accounts[fromIndex]));
    console.log('');
    this.log('Not enough Ether. Balance:', balanceEther, 'Required:', requiredAmount);
    console.log('');
  }
};

/**
 * Transfer Ether between your accounts
 * @param {number} fromIndex - Index in web3.eth.accounts to send Ether from.
 * @param {number} toIndex - Index in web3.eth.accounts to send Ether to.
 * @param {number} amount - Amount of Ether to transfer over
 */
delib.transfer = function(fromIndex , toIndex, amount) {
  if (fromIndex === toIndex) return;
  if (fromIndex < 0 || toIndex < 0) return;
  if (fromIndex > web3.eth.accounts.length - 1 || toIndex > web3.eth.accounts.length - 1) return;

  var balanceEther = this.etherToWei(web3.eth.getBalance(web3.eth.coinbase));
  if (balanceEther < amount) {
    console.log('');
    this.log('Not enough Ether. Balance:', balanceEther);
    console.log('');
    return;
  }
  var object = {
    from: web3.eth.accounts[fromIndex],
    to: web3.eth.accounts[toIndex],
    value: this.etherToWei(amount)
  };
  web3.eth.sendTransaction(object);
  console.log('');
  this.log(amount, 'Ether transfered to', web3.eth.accounts[fromIndex], 'from', web3.eth.accounts[toIndex]);
  console.log('');
  this.mine(1);
};

/** Mine a specified number of blocks
 * @param {number} blocks - Number of blocks to mine
 */
delib.mine = function(blocks) {
  if (blocks <= 0 || web3.eth.mining === true) return;
  var stopBlock = web3.eth.blockNumber + blocks;
  this.start();

  // Create the filter to watch with check function
  var filter = web3.eth.filter('latest');
  filter.watch(check.bind(this));

  // To save status of current autoMine status to know whether or not to turn it back on
  var autoStatus = this.autoMine;
  this.autoMine = false;
  console.log('');
  delib.log('Mining', blocks, 'blocks');
  console.log('');

  function check() {
    if (stopBlock === web3.eth.blockNumber || web3.eth.mining === false) {
      // Stop watching filter
      filter.stopWatching();
      autoStatus ? this.autoMine = true : this.stop();
    }
  }
};

/**
* Change the coinbase to another one of your accounts
* @param accountIndex - Index in web3.eth.accounts.
*/
delib.coinbase = function(accountIndex) {
  if (accountIndex < 0 || accountIndex > web3.eth.accounts.length - 1) return;
  web3.miner.setEtherbase(web3.eth.accounts[accountIndex]);
  console.log('');
  this.log('Coinbase set to', web3.eth.coinbase);
  console.log('');
};

/** Wei to Ether conversion */
delib.weiToEther = function (amount) {
  return web3.fromWei(web3.toBigNumber(amount), 'ether');
};

/** Ether to Wei conversion */
delib.etherToWei = function(amount) {
  return web3.toWei(web3.toBigNumber(amount), 'ether');
};

/**
 * Run on devchain start
 */
(function () {
  // amount of Ether for coinbank to always have
  delib.minAmount;
  // amount of accounts to create. Always creates 1 account.
  var accountAmount = (delib.accountAmount > 0) ? delib.accountAmount : 1;
  // amount of Ether to distribute to accounts
  var distributeAmount = (delib.distributeAmount < 0) ? 0 : delib.distributeAmount;
  // amount of Ether needed by coinbank
  var requiredEtherAmount = delib.distributeAmount * delib.accountAmount + 2;
  // Status of toggling mining if there are transactions pending and whether to keep coinbank topped off at minAmount
  var password = delib.password; // password for the accounts created
  var blockNumber = web3.blockNumber; // the block number to keep mining too

  var distributeBlock; // block number when distributed for reference
  var isBalanceDisplayed = false;
  var isDistributed = (distributeAmount === 0) ? true : false; // status of ether distribution

  var transactions = []; // to contain pending transaction hashes of a block

  console.log('');
  delib.log('DeLib Development Blockchain');
  console.log('');
  delib.log('Node address:', web3.admin.nodeInfo.enode);
  console.log('');

  if (delib.autoMine === true) {
    isDistributed = true; // Don't allow for auto distribution if auto is off at the start
    delib.log('Auto On');
    delib.log('Coinbase will be remain above', delib.minAmount, 'Ether');
    delib.log('Mining will start automatically when there are transactions pending');
    if (distributeAmount !== 0) {
      delib.log('Distributing', distributeAmount, 'to accounts when coinbase has', requiredEtherAmount, 'Ether');
    }
  } else {
    delib.log('Auto Off');
    delib.log('To start/stop mining call delib.start(), delib.stop()');
    delib.log('To toggle auto mining for transactions call delib.auto()');
  }

  createAccounts(accountAmount, password);

  // To allow for continous checking of status
  web3.eth.filter('latest', checkStatus);
  web3.eth.filter('pending', checkStatus);

  if (delib.autoMine === true) delib.start();

  function checkStatus() {
    // Display the transaction receipt of previous blocks
    if (transactions.length > 0) {
      for (var i = 0; i < transactions.length; i++) {
        var transactionHash = transactions[i];
        transactionReceipt(transactionHash);
      }
      transactions = [];
    }

    // Fill transactions array to display receipts in next bock
    if (web3.eth.getBlock('pending').transactions.length > 0) {
      transactions = web3.eth.getBlock('pending').transactions;
    }

    // Auto mining actions
    if (delib.autoMine === true) {
      // For distributing Ether to accounts and displaying it
      if (isBalanceDisplayed === false && distributeBlock + 2 <= web3.eth.blockNumber) {
        delib.accounts();
        isBalanceDisplayed = true;
      }
      if (isDistributed === false) {
        distributeEther();
        blockNumber = web3.eth.blockNumber + 5;
      }

      if (web3.eth.getBlock('pending').transactions.length > 0) {
        blockNumber = web3.eth.blockNumber + 5;
        delib.start();
        return;
      }

      if (web3.eth.getBalance(web3.eth.coinbase).lessThan(delib.etherToWei(delib.minAmount))) {
        delib.start();
        return;
      }

      if (web3.eth.blockNumber > blockNumber) {
        delib.stop();
        return;
      }
    }
  }

  // Create the specified number of accounts
  function createAccounts(accountAmount, password) {
    console.log('');
    delib.log('Creating ' + accountAmount + ' accounts with password ' + '"' + password + '"');
    for (var i = 0; i < accountAmount; i++) {
      web3.personal.newAccount(password);
      web3.personal.unlockAccount(web3.eth.accounts[web3.eth.accounts.length - 1], password, 10000000);
      delib.log(web3.eth.accounts[i]);
    }
    delib.accounts();
  }

  // Display the transaction receipts
  function transactionReceipt(transactionHash) {
    var transactionObj = web3.eth.getTransactionReceipt(transactionHash);
    console.log('');
    delib.log('Transaction Receipt');
    delib.log('Block:    ', transactionObj.blockNumber);
    delib.log('Hash:     ', transactionObj.transactionHash);
    delib.log('From:     ', transactionObj.from);
    delib.log('To:       ', transactionObj.to);
    delib.log('Gas Used: ', transactionObj.gasUsed);
    delib.log('Total Gas:', transactionObj.cumulativeGasUsed);
    delib.log('Contract: ', transactionObj.contractAddress);
    console.log('');
  }

  // Auto distribute ether to all your accounts
  function distributeEther() {
    if (web3.eth.getBalance(web3.eth.coinbase).greaterThan(delib.etherToWei(requiredEtherAmount))) {
      for (var i = 0; i < accountAmount; i++) {
        if (web3.eth.getBalance(web3.eth.accounts[i]).lessThan(delib.etherToWei(distributeAmount))) {
          var object = {
            from: web3.eth.coinbase,
            to: web3.eth.accounts[i],
            value: delib.etherToWei(distributeAmount)
          };
          web3.eth.sendTransaction(object);
        }
      }
      console.log('');
      delib.log(distributeAmount, 'Ether distributed to accounts');
      console.log('');
      distributeBlock = web3.eth.blockNumber;
      isDistributed = true;
    }
  }
})();
