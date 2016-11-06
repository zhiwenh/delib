/* global web3, CONFIG */

/** The global delib methods */
var delib = CONFIG; // CONFIG object gets built onto this file

/** Displays all accounts, balances, and indexes */
delib.accounts = function() {
  console.log('');
  this.log('=== Accounts ===');
  this.log('Index  Account                                      Ether');
  for (var i = 0; i < web3.eth.accounts.length; i++) {
    if (web3.eth.accounts[i] === web3.eth.coinbase) {
      delib.log(i, '    ', web3.eth.accounts[i], ' ', this.weiToEther(web3.eth.getBalance(web3.eth.accounts[i]).toString(10)), '- coinbase');
    } else {
      delib.log(i, '    ', web3.eth.accounts[i], ' ', this.weiToEther(web3.eth.getBalance(web3.eth.accounts[i]).toString(10)));
    }
  }
  console.log('');
  return true;
};

/**
 * To start mining
 * @param {number} threads - Optional. The number of threads to mine with. Defaults to 1/
 */
delib.start = function(threads) {
  threads = threads || 1;
  if (!web3.eth.mining) {
    console.log('');
    delib.log('Starting miner');
    console.log('');
    web3.miner.start(threads);
    return true;
  }
  return false;
};

/** To stop mining */
delib.stop = function() {
  if (web3.eth.mining) {
    console.log('');
    delib.log('Stopping miner');
    console.log('');
    web3.miner.stop();
    return true;
  }
  return false;
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
  return true;
};


/**
 * Distributes Ether to all of your accounts from an account
 * @param {number} fromIndex - Index in web3.eth.accounts to sender Ether from
 * @param {number} etherAmount - Amount to transfer to all accounts
 */
delib.distribute = function(fromIndex, etherAmount) {
  var requiredAmount = etherAmount * (web3.eth.accounts.length - 1) + 2;
  if (web3.eth.getBalance(web3.eth.accounts[fromIndex]).greaterThan(this.etherToWei(requiredAmount))) {
    for (var i = 0; i < web3.eth.accounts.length; i++) {
      if (i === fromIndex) continue;
      var object = {
        from: web3.eth.accounts[fromIndex],
        to: web3.eth.accounts[i],
        value: this.etherToWei(etherAmount)
      };
      web3.eth.sendTransaction(object);
    }
    console.log('');
    this.log(etherAmount, 'Ether distributed to accounts');
    console.log('');
    this.mine(2);
    return true;
  } else {
    var balanceEther = this.etherToWei(web3.eth.getBalance(web3.eth.accounts[fromIndex]));
    console.log('');
    this.log('Not enough Ether. Balance:', balanceEther, 'Required:', requiredAmount);
    console.log('');
    return false;
  }
};

/**
 * Transfer Ether between your accounts
 * @param {number} fromIndex - Index in web3.eth.accounts to send Ether from.
 * @param {number} toIndex - Index in web3.eth.accounts to send Ether to.
 * @param {number} etherAmount - Amount of Ether to transfer over
 */
delib.transfer = function(fromIndex , toIndex, etherAmount) {
  if (fromIndex === toIndex) return;
  if (fromIndex < 0 || toIndex < 0) return;
  if (fromIndex > web3.eth.accounts.length - 1 || toIndex > web3.eth.accounts.length - 1) return;

  var balanceEther = this.weiToEther(web3.eth.getBalance(web3.eth.accounts[fromIndex]));
  if (balanceEther < etherAmount) {
    console.log('');
    this.log('Not enough Ether. Balance:', balanceEther);
    console.log('');
    return;
  }
  var object = {
    from: web3.eth.accounts[fromIndex],
    to: web3.eth.accounts[toIndex],
    value: this.etherToWei(etherAmount)
  };
  web3.eth.sendTransaction(object);
  console.log('');
  this.log(etherAmount, 'Ether transfered to', web3.eth.accounts[fromIndex], 'from', web3.eth.accounts[toIndex]);
  console.log('');
  this.mine(2);
  return true;
};

/**
 * Mine a specified number of blocks
 * @param {number} blockAmount - Number of blocks to mine
 */
delib.mine = function(blockAmount) {
  blockAmount = blockAmount || 1;
  if (blockAmount <= 0 || web3.eth.mining === true) return false;
  var stopBlock = web3.eth.blockNumber + blockAmount;
  this.start();

  // keep ref to auto mine status when called to set it back to it later
  var autoStatus = this.autoMine;
  this.autoMine = false;

  // Create the filter to watch with check function
  var filter = web3.eth.filter('latest');
  filter.watch(check.bind(this));

  console.log('');
  delib.log('Mining', blockAmount, 'blocks');
  console.log('');

  function check() {
    if (web3.eth.blockNumber >= stopBlock || web3.eth.mining === false) {
      // Stop watching filter
      this.autoMine = autoStatus;
      if (this.autoMine !== true) this.stop();
      filter.stopWatching();
    }
  }
  return true;
};

/**
 * Display block info
 * @param {number} blockNumber - Optional. The block number to display the info of. Defaults to 'latest'.
 */
delib.block = function(blockNumber) {
  blockNumber = blockNumber || 'latest';
  web3.eth.getBlock(blockNumber, function(err, block) {
    if (!err) {
      console.log('');
      this.log('Block Info');
      this.log('Number:     ' + block.number);
      this.log('Hash:       ' + block.hash);
      this.log('Difficulty: ' + block.difficulty);
      this.log('Gas Limit:  ' + block.gasLimit.toString());
      this.log('Gas Price:  ' + web3.eth.gasPrice.toString());
      this.log('Total Gas:  ' + block.gasUsed);
      this.log('Miner:      ' + block.miner);
      console.log('');
    }
  }.bind(this));
  return true;
};

/**
* Change the coinbase to another one of your accounts. This is where the Ether mining rewards are deposited.
* @param accountIndex - Index in web3.eth.accounts.
*/
delib.coinbase = function(accountIndex) {
  if (accountIndex < 0 || accountIndex > web3.eth.accounts.length - 1) return false;
  web3.miner.setEtherbase(web3.eth.accounts[accountIndex]);
  console.log('');
  this.log('Coinbase set to', web3.eth.coinbase);
  console.log('');
  return true;
};

/** Wei to Ether conversion */
delib.weiToEther = function (amount) {
  return Number(web3.fromWei(amount, 'ether').toString());
};

/** Ether to Wei conversion */
delib.etherToWei = function(amount) {
  return Number(web3.toWei(amount, 'ether').toString());
};

/** DeLib console log */
delib.log = function() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift('[delib]');
  args.concat(arguments);
  console.log.apply(this, args);
};

/** Display delib methods */
delib.help = function() {
  console.log('');
  this.log('=== delib Methods ===');
  this.log('delib');
  this.log(' .minAmount', '                           Set the minimum amount to mine to');
  this.log(' .accounts()', '                          Displays all accounts, balances, and indexes');
  this.log(' .auto()', '                              Toggles auto mining');
  this.log(' .start(threads)', '                      Start mining', '- threads defaults to 1');
  this.log(' .stop()', '                              Stop mining');
  this.log(' .transfer(fromIndex, toIndex, ether)', ' Transfer Ether between your accounts');
  this.log(' .distribute(fromIndex, ether)   ', '     Distribute Ether to all of your accounts from an account');
  this.log(' .mine(blockAmount)', '                   Mine a specified number of blocks', '- blockAmount defaults to 1');
  this.log(' .block(blockNumber)', '                  Display block info', '- blockNumber defaults to latest');
  this.log(' .coinbase(accountIndex)', '              Change coinbase');
  this.log(' .help()', '                              Display delib methods');
  console.log('');
  return true;
};

/**
 * Run on devchain start
 */
(function () {
  // Amount of Ether for coinbank to always have
  delib.minAmount;
  // Amount of accounts to create. Always creates 1 account.
  var accountAmount = (delib.accountAmount > 0) ? delib.accountAmount : 1;
  accountAmount -= web3.eth.accounts.length; // Don't allow creation if accounts are already there
  // Amount of Ether to distribute to accounts
  var distributeAmount = (delib.distributeAmount < 0) ? 0 : delib.distributeAmount;
  // Amount of Ether needed by coinbank
  var requiredEtherAmount = delib.distributeAmount * delib.accountAmount + 1;
  // Status of toggling mining if there are transactions pending and whether to keep coinbank topped off at minAmount
  var password = delib.password; // password for the accounts created
  var blockNumber = web3.eth.blockNumber; // the block number to keep mining too

  // For the automatic Ether distribution
  var distributeBlock; // block number when distributed for reference
  var isBalanceDisplayed = false;
  var isDistributed = (distributeAmount === 0 || !delib.reset) ? true : false; // status of ether distribution

  var transactions = []; // to contain pending transaction hashes of a block
  var pendingBlock; // to make sure transactions are only displayed after another block is mined

  console.log('');
  delib.log('Path to blockchain data:', delib.path);
  console.log('');
  delib.log('Node address:', web3.admin.nodeInfo.enode);
  console.log('');
  delib.log('=== DeLib Development Blockchain ===');
  delib.help(); // Display delib methods and info

  if (delib.autoMine === true) {
    delib.log('Auto mining is on');
    delib.log('Coinbase will be remain above', delib.minAmount, 'Ether. Set delib.minAmount to adjust');
    delib.log('Mining will start automatically when there are transactions pending');
    if (distributeAmount !== 0) {
      delib.log('Distributing', distributeAmount, 'to accounts when coinbase has', requiredEtherAmount, 'Ether');
    }
  } else {
    isDistributed = true; // Don't allow for auto distribution if auto is off at the start
    delib.log('Auto mining is off');
    delib.log('To start/stop mining call delib.start() / delib.stop()');
    delib.log('To toggle auto mining call delib.auto()');
  }

  // Creates all accounts
  if (accountAmount > 0) {
    createAccounts(accountAmount, password);
  } else {
    unlockAccounts();
  }
  delib.accounts();

  // To allow for continous checking of status
  web3.eth.filter('latest', checkStatus);
  web3.eth.filter('pending', checkStatus);

  if (delib.autoMine === true) delib.start();

  function checkStatus() {
    // Display the transaction receipt of previous blocks
    if (transactions.length > 0 && web3.eth.blockNumber > pendingBlock) {
      for (var i = 0; i < transactions.length; i++) {
        var transactionHash = transactions[i];
        transactionReceipt(transactionHash);
      }
      transactions = [];
    }

    // Fill transactions array to display receipts in next bock
    if (web3.eth.getBlock('pending').transactions.length > 0) {
      pendingBlock = web3.eth.blockNumber;
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
      }

      if (web3.eth.getBlock('pending').transactions.length > 0) {
        blockNumber = web3.eth.blockNumber + 3;
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
    if (accountAmount <= 0) return;
    console.log('');
    delib.log('Creating ' + accountAmount + ' accounts with password ' + '"' + password + '"');
    for (var i = 0; i < accountAmount; i++) {
      web3.personal.newAccount(password);
      web3.personal.unlockAccount(web3.eth.accounts[web3.eth.accounts.length - 1], password, 10000000);
      delib.log('.');
    }
  }

  function unlockAccounts() {
    console.log('');
    delib.log('Unlocking accounts');
    for (var i = 0; i < web3.eth.accounts.length; i++) {
      try {
        web3.personal.unlockAccount(web3.eth.accounts[i], password, 10000000);
        delib.log('.');
      } catch (e) {
        delib.log('Unable to unlock account', i);
        delib.log('Unlock with: web3.personal.unlockAccount(' + web3.eth.accounts[i] + ', \'yourpassword\', 100000)');
      }
    }
    console.log('.');
  }
  // Display the transaction receipts
  function transactionReceipt(transactionHash) {
    var transactionObj = web3.eth.getTransactionReceipt(transactionHash);
    console.log('');
    delib.log('=== Transaction Receipt ===');
    delib.log('Block:            ', transactionObj.blockNumber);
    delib.log('Hash:             ', transactionObj.transactionHash);
    delib.log('From:             ', transactionObj.from);
    delib.log('To:               ', transactionObj.to);
    delib.log('Gas Used:         ', transactionObj.gasUsed);
    delib.log('Ether Cost Est:   ', delib.weiToEther(web3.eth.gasPrice * transactionObj.gasUsed));
    delib.log('Created Contract: ', transactionObj.contractAddress);
    console.log('');
  }

  // Auto distribute ether to all your accounts
  function distributeEther() {
    if (web3.eth.getBalance(web3.eth.coinbase).greaterThan(delib.etherToWei(requiredEtherAmount))) {
      var doesOneDistribute = false; // check to see if there needs to be a blank line consoled
      for (var i = 0; i < web3.eth.accounts.length; i++) {
        if (web3.eth.accounts[i] !== web3.eth.coinbase && web3.eth.getBalance(web3.eth.accounts[i]) == 0) {
          var object = {
            from: web3.eth.coinbase,
            to: web3.eth.accounts[i],
            value: delib.etherToWei(distributeAmount)
          };
          web3.eth.sendTransaction(object);
          if (!doesOneDistribute) {
            console.log('');
            doesOneDistribute = true;
          }
          delib.log('Distributed', distributeAmount, 'Ether to account', i);
          distributeBlock = web3.eth.blockNumber;
        }
      }
      if (doesOneDistribute) console.log('');
      isDistributed = true;
    }
  }
})();
