'use strict';

process.chdir(__dirname);

const tape = require('tape');
const tapes = require('tapes');
const tapSpec = require('tap-spec');

const delib = require('./../../index');

tape.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout);

const test = tapes(tape);

/** Put an x in front of test to skip it */
const xtest = (describe, callback) => {
  console.log('  x Skipping: ', describe);
};

delib.init();

test('Connection status should be true', t => {
  delib.isConnected()
    .then(status => {
      t.equal(status, true, 'Expect connection status to true')
      t.end();
    })
    .catch(err => {
      console.error(err);
      t.fail();
    });
});

test('Accounts should preload', t => {
  delib.getAccounts()
    .then(accounts => {
      t.equal(accounts[accounts.length - 3], '0xbAC3445BD79019140361B2667385b82d520d409d', 'Expect the address to be preloaded');
      t.equal(accounts[accounts.length - 2], '0xFB06BDa4C709660a946c9020ae2c09903DffFc69', 'Expect the address to be preloaded');
      t.equal(accounts[accounts.length - 1], '0x84ABBFC9a6FC35AB259219A312CeC516c53C23c9', 'Expect the address to be preloaded');

      t.end()
    })
    .catch(err => {
      console.error(err);
      t.fail()
    });
});

test('Transfering Ether from one account to another with gas estimate', t => {
  let balance1;

  delib.balanceOf(1)
    .then(res => {
      balance1 = res;
      return delib.web3.eth.getAccounts()
    })
    .then(accounts => {
      return delib.transfer(accounts[1], 100000, {from: accounts[0]})
    })
    .then(tx => {
      return delib.balanceOf(1);
    })
    .then(balance2 => {
      t.equal(balance2 - balance1, 196608, 'Expect balance of other account to have increased by 196608');
      t.end();
    })
    .catch(err => {
      console.error(err);
      t.fail()
    })
})

test('Transfering Ether from one account to another with no gas estimate', t => {
  let balance1;

  delib.balanceOf(1)
    .then(res => {
      balance1 = res;
      return delib.web3.eth.getAccounts()
    })
    .then(accounts => {
      return delib.transfer(accounts[1], 100000, {from: accounts[0], gas: 21000})
    })
    .then(tx => {
      return delib.balanceOf(1);
    })
    .then(balance2 => {
      t.equal(balance2 - balance1, 98304, 'Expect balance of other account to have increased by 196608');
      t.end();
    })
    .catch(err => {
      console.error(err);
      t.fail()
    })
})

test('Adding account', t => {
  delib.addAccount('jealous expect hundred young unlock disagree major siren surge acoustic machine catalog')
    .then(key => {
      return delib.getAccounts();
    })
    .then(accounts => {
      t.equal(accounts[accounts.length - 1], '0x1008C71D0AbCd7a9ce751FE6c2782D381489258F', 'Expect accounts list to contain newly added account');
      t.end();
    })
    .catch(err => {
      console.error(err);
      t.fail();
    })
});

test('Creating an account', t => {
  let length1;
  let length2;

  delib.getAccounts()
    .then(accounts => {
      length1 = accounts.length;
      return delib.createAccount();
    })
    .then(account => {
      return delib.getAccounts();
    })
    .then(accounts => {
      length2 = accounts.length;
      t.equal(length1 + 1, length2, 'Expect the length of account list after creating an account be 1 greater than before creating an account');
      t.end();
    })
    .catch(err => {
      console.error(err);
      t.fail();
    })
});

test('Building contracts', t => {
  delib.build()
    .then(contracts => {
      t.equal(contracts[0], 'BadBank', 'Expect first contract to be BadBank');
      t.equal(contracts[1], 'Bank', 'Expect second contract to be Bank');
      t.end();
    })
    .catch(err => {
      console.error(err);
      t.fail();
    });
});

test('Deploying MathLib and Example contract', t => {
  const web3 = delib.init();

  let mathLibAddress;
  let arrayAddress;

  delib.deploy('MathLib')
    .then(instance => {
      mathLibAddress = instance.address;
      return delib.deploy('Array');
    })
    .then(instance => {
      arrayAddress = instance.address;

      return delib.deploy('Example', [], {}, [{'LibraryTest.sol:MathLib': mathLibAddress}, {'LibraryTest.sol:Array': arrayAddress}]);
    })
    .then(instance => {
      t.notEqual(instance.address, undefined, 'Expect deploy to return an instance with an address property');
      t.end();
    })
    .catch(err => {
      console.error(err);
      t.fail();
    });
});

test('Deploying Bank contract with gas estimate', t => {
  const web3 = delib.init();

  delib.deploy.estimate('Bank')
    .then(estimate => {
      t.equal(estimate > 100000, true, 'Expect deploy.estimate to return an estimate greater than 100000');
      t.equal(estimate < 600000, true, 'Expect deploy.estimate to return an estimate less than 600000');

      return delib.deploy('Bank');
    })
    .then(instance => {
      t.notEqual(instance.address, undefined, 'Expect deploy to return an instance with an address property');
      t.end();
    })
    .catch(err => {
      console.error(err);
      t.fail();
    });
});

test('Deploying Bank contract with no gas estimate', t => {
  const web3 = delib.init();
  delib.deploy('Bank', [], {gas: 800000})
    .then(instance => {
      t.notEqual(instance.address, undefined, 'Expect deploy to return an instance with an address property');
      t.end();
    })
    .catch(err => {
      console.error(err);
      t.fail();
    });
});

test('Executing Bank contract methods with gas estimate', t => {
  delib.deploy('Bank')
    .then(instance => {
      return delib.exec('Bank').estimate.deposit({
        value: 4
      });
    })
    .then(estimate => {
      t.equal(estimate > 30000, true, 'Expect exec.estimate to return a gas estimate greater than 30000');
      t.equal(estimate < 200000, true, 'Expect exec.estimate to return a gas estimate less than 200000');

      return delib.exec('Bank').deposit({
        value: 4
      });
    })
    .then(tx => {
      t.ok(tx, 'Expect deposit method with a value of 4 to return a tx response');
      return delib.exec('Bank').call.checkAmount();
    })
    .then(amount => {
      t.equal(Number(amount), 4, 'Expect exec.call checkAmount method to return 4');
      return delib.exec('Bank').withdraw(4, {gas: 100000});
    })
    .then(tx => {
      t.ok(tx, 'Expect withdraw method to return a tx response');
      return delib.exec('Bank').call.checkAmount();
    })
    .then(amount => {
      t.equal(Number(amount), 0, 'Expect checkAmount method to return 0 now');
      t.end();
    })
    .catch(err => {
      console.error(err);
      t.fail();
    });
});

test('Executing Bank contract methods with no gas estimate', t => {
  delib.init();
  const gas = 100000;
  delib.deploy('Bank')
    .then(instance => {
      return delib.exec('Bank').deposit({
        value: 4,
        gas: gas
      });
    })
    .then(tx => {
      t.ok(tx, 'Expect deposit method with a value of 4 to return a tx response');
      return delib.exec('Bank').call.checkAmount({gas: gas});
    })
    .then(amount => {
      t.equal(Number(amount), 4, 'Expect checkAmount method to return 4');
      t.end();
    })
    .catch(err => {
      console.error(err);
      t.fail();
    });
});

test('Testing deploy instance', t => {
  const gas = 100000;

  let contractInstance;
  delib.deploy('Bank')
    .then(instance => {
      contractInstance = instance;
      return contractInstance.deposit({
        value: 4
      });
    })
    .then(tx => {
      t.ok(tx, 'Expect deposit method with a value of 4 to return a tx response');
      return contractInstance.call.checkAmount();
    })
    .then(amount => {
      t.equal(Number(amount), 4, 'Expect checkAmount method to return 4');
      t.end();
    })
    .catch(err => {
      console.error(err);
      t.fail();
    });
});

test('Getting Bank contract event logs', t => {
  const gas = 100000;

  let instance;
  let deploymentBlockNumber;

  delib.deploy('Bank')
    .then(instance1 => {
      instance = instance1;
      deploymentBlockNumber = instance1.blockCreated;
      const promises = [
        delib.exec('Bank').deposit({value: 3, account: 0, gas: gas}),
        delib.exec('Bank').deposit({value: 4, account: 0, gas: gas}),
        delib.exec('Bank').deposit({value: 5, account: 0, gas: gas}),
      ];

      console.log('    - Executing deposit 9 times');
      return Promise.all(promises);
    })
    .then(txs => {
      const promises = [
        delib.exec('Bank').deposit({value: 6, account: 0, gas: gas}),
        delib.exec('Bank').deposit({value: 3, account: 1, gas: gas}),
        delib.exec('Bank').deposit({value: 4, account: 1, gas: gas}),
      ];

      return Promise.all(promises);
    })
    .then(txs => {
      const promises = [
        delib.exec('Bank').deposit({value: 5, account: 1, gas: gas}),
        delib.exec('Bank').deposit({value: 3, account: 2, gas: gas}),
        delib.exec('Bank').deposit({value: 4, account: 2, gas: gas}),
      ];
      return Promise.all(promises);
    })
    .then(txs => {

      const promises = [
        delib.exec('Bank').withdraw(1, {account: 0, gas: gas}),
        delib.exec('Bank').withdraw(1, {account: 1, gas: gas}),
        delib.exec('Bank').withdraw(1, {account: 2, gas: gas}),
      ];
      console.log('    - Executing withdraw 3 times');

      return Promise.all(promises);
    })
    .then(logs => {

      return delib.web3.eth.getBlockNumber();
    })
    .then(blockNumber => {
      const eventOptions = {
        fromBlock: deploymentBlockNumber,
        toBlock: blockNumber
      };

      return delib.events('Bank', 'depositEvent', eventOptions);
    })
    .then(logs => {
      t.equal(logs.length, 9, 'Expect the depositEvent to return 9 logs');
      // return delib.events('Bank', 'withdrawEvent', 'all');
      t.end();
    })
    .catch(err => {
      console.error(err);
      t.fail();
    })

});

test('Watching for Bank contract event logs', t => {
  const depositLogs = [];
  const withdrawLogs = [];
  const web3 = delib.changeProvider('ws');
  const gas = 100000;

  let withdrawWatch;
  let depositWatch;

  delib.deploy('Bank')
    .then(instance => {
      const filter = {
        args: {
          _amount: (amount) => {
            if (Number(amount) === 3 || Number(amount) === 4) {
              return true;
            } else {
              return false;
            }
          }
        }
      };

      depositWatch = delib.watch('Bank', 'depositEvent', filter, (err, log) => {
        if (err) {
          t.fail();
        } else {
          depositLogs.push(log);
        }
      });

      withdrawWatch = delib.watch('Bank', 'withdrawEvent', filter, (err, log) => {
        if (err) {
          t.fail();
        } else {
          withdrawLogs.push(log);
        }
      });

      console.log('    - Performing deposits and withdraws');

      return delib.exec('Bank').deposit({value: 10, gas: gas});
    })
    .then((tx) => {
      return delib.exec('Bank').withdraw(10, {gas: gas});
    })
    .then((tx) => {
      return delib.exec('Bank').deposit({value: 3, gas: gas});
    })
    .then((tx) => {
      return delib.exec('Bank').deposit({value: 4, gas: gas});
    })
    .then((tx) => {
      return delib.exec('Bank').withdraw(4, {gas: gas});
    })
    .then((tx) => {
      return delib.exec('Bank').withdraw(3, {gas: gas});
    })
    .then(tx => {
      return delib.exec('Bank').withdraw(1, {gas: gas});
    })
    .then((tx) => {
      t.equal(depositLogs.length, 3, 'Expect 3 deposit logs');
      t.equal(Number(depositLogs[0].returnValues._amount), 10, 'Expect 1st deposit to have an amount of 3');
      t.equal(Number(depositLogs[1].returnValues._amount), 3, 'Expect 2nd deposit to have an amount of 4');

      t.equal(withdrawLogs.length, 3, 'Expect 3 withdraw logs');
      t.equal(Number(withdrawLogs[0].returnValues._amount), 10, 'Expect 1st deposit to have an amount of 4');
      t.equal(Number(withdrawLogs[1].returnValues._amount), 4, 'Expect 2nd deposit to have an amount of 3');

      withdrawWatch.stop();
      depositWatch.stop();

      delib.closeWSConnection();

      t.end();
    })
    .catch(err => {
      t.fail();
      console.error(err);
    });
});
