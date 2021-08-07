'use strict';

/**
 * These tests are done with a geth node on a private chain. To make the
 * setup easier I used an npm package that I developed called devchain.
 * Gas estimates and events on testrpc have issues.
 */

process.chdir(__dirname); // So use with npm test works

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

test('Transfering Ether from one account to another', t => {
  delib.init()
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
      console.log(tx);
    })
    .then(balance2 => {
      t.equal(balance2 - balance1, 98304, 'Expect balance of other account to have increased by 98304');
      t.end();
    })
    .catch(err => {
      console.log(err);
      t.fail()
    })
})

test('Adding account', t => {
  delib.addAccount('c12531487c04583fb5e101c3588e77bf37913f0feca3848779432f09115369bf')
    .then(res => {
      console.log(res);
      return delib.getAccounts()
    })
    .then(accounts => {
      console.log('accounts', accounts);
      t.end();
    })
    .catch(err => {
      console.log(err);
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
      mathLibAddress = instance.options.address;
      return delib.deploy('Array');
    })
    .then(instance => {
      arrayAddress = instance.options.address;

      return delib.deploy('Example', [], {}, [{'LibraryTest.sol:MathLib': mathLibAddress}, {'LibraryTest.sol:Array': arrayAddress}]);
    })
    .then(instance => {
      t.notEqual(instance.options.address, undefined, 'Expect deploy to return an instance with an address property');
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
      t.notEqual(instance.options.address, undefined, 'Expect deploy to return an instance with an address property');
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
      t.notEqual(instance.options.address, undefined, 'Expect deploy to return an instance with an address property');
      t.end();
    })
    .catch(err => {
      console.error(err);
      t.fail();
    });
});

test('Executing Bank contract methods with gas estimate', t => {
  delib.init();
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

test('Getting Bank contract event logs', t => {
  delib.init();
  const gas = 100000;

  delib.deploy('Bank')
    .then(instance => {
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
      return delib.events('Bank', 'depositEvent', 'all');
    })
    .then(logs => {
      t.equal(logs.length, 9, 'Expect the depositEvent to return 9 logs');

      return delib.events('Bank', 'withdrawEvent', 'all');
    })
    .then(logs => {
      t.equal(logs.length, 3, 'Expect withdrawEvent to return 3 logs');

      t.end();
      // return delib.events('Bank', 'depositEvent', 'all', filter);
    })
    // .then(logs => {
    //   const web3 = delib.init();
    //   t.equal(logs.length, 2, 'Expect depositEvent to return 2 logs with the filter object { args: { _amount: callback for 5 } }');
      //
      // const filter = {
      //   args: {
      //     _user: [web3.eth.accounts[0], web3.eth.accounts[1]],
      //     _amount: (amount) => {
      //       if (Number(amount) === 3) {
      //         return true;
      //       } else {
      //         return false;
      //       }
      //     }
      //   }
      // };
      //
      // return delib.events('Bank', 'depositEvent', 'all', filter);
    // })
    // .then(logs => {
    //   t.equal(logs.length, 2, 'Expect depositEvent to return 2 logs with the filter object { args: { _user: [acc0, acc1], _amount: callback for 3 } }');
    //
    //   t.end();
    // })
    .catch(err => {
      console.error(err);
      t.fail();
    });
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

      t.end();
    })
    .catch(err => {
      t.fail();
      console.error(err);
    });
});
