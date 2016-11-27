'use strict';

/**
 * These tests are done with a geth node on a private chain. To make the
 * setup easier I used an npm package that I developed called devchain.
 * Gas estimates and events on testrpc have issues.
 */
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

test('Initializing connection', t => {
  delib.eth.init();

  t.equal(delib.eth.checkConnection('rpc'), true, 'Expect checkConnection rpc to be true');

  delib.eth.initIPC('./chain1/devchain/geth.ipc');

  t.equal(delib.eth.checkConnection('ipc'), true, 'Expect checkConnect ipc to be true');

  delib.eth.closeIPC();

  t.end();
});

test('Building Bank contract', t => {
  delib.eth.build('Bank')
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

test('Deploying Bank contract with gas estimate', t => {
  delib.eth.init();

  delib.eth.deploy.estimate('Bank')
    .then(estimate => {
      t.equal(estimate > 100000, true, 'Expect deploy.estimate to return an estimate greater than 100000');
      t.equal(estimate < 500000, true, 'Expect deploy.estimate to return an estimate less than 500000');

      return delib.eth.deploy('Bank');
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
  delib.eth.init();

  delib.eth.deploy('Bank', [], {gas: 3000000})
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
  delib.eth.init();
  delib.eth.deploy('Bank')
    .then(instance => {
      return delib.eth.exec('Bank').estimate.deposit({
        value: 4
      });
    })
    .then(estimate => {
      t.equal(estimate > 30000, true, 'Expect exec.estimate to return a gas estimate greater than 30000');
      t.equal(estimate < 200000, true, 'Expect exec.estimate to return a gas estimate less than 200000');

      return delib.eth.exec('Bank').deposit({
        value: 4
      });
    })
    .then(tx => {
      t.ok(tx, 'Expect deposit method with a value of 4 to return a tx response');
      return delib.eth.exec('Bank').checkAmount();
    })
    .then(amount => {
      t.equal(Number(amount), 4, 'Expect checkAmount method to return 4');
      return delib.eth.exec('Bank').withdraw(0);
    })
    .then(tx => {
      t.ok(tx, 'Expect withdraw method to return a tx response');
      return delib.eth.exec('Bank').checkAmount();
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
  delib.eth.init();
  const gas = 500000;
  delib.eth.deploy('Bank')
    .then(instance => {
      return delib.eth.exec('Bank').deposit({
        value: 4,
        gas: gas
      });
    })
    .then(tx => {
      t.ok(tx, 'Expect deposit method with a value of 4 to return a tx response');
      return delib.eth.exec('Bank').checkAmount({gas: gas});
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
  delib.eth.init();

  delib.eth.deploy('Bank')
    .then(instance => {
      const promises = [
        delib.eth.exec('Bank').deposit({value: 3, account: 0}),
        delib.eth.exec('Bank').deposit({value: 4, account: 0}),
        delib.eth.exec('Bank').deposit({value: 5, account: 0}),
      ];

      console.log('    - Executing deposit 9 times');
      return Promise.all(promises);
    })
    .then(txs => {
      const promises = [
        delib.eth.exec('Bank').deposit({value: 6, account: 0}),
        delib.eth.exec('Bank').deposit({value: 3, account: 1}),
        delib.eth.exec('Bank').deposit({value: 4, account: 1}),
      ];

      return Promise.all(promises);
    })
    .then(txs => {
      const promises = [
        delib.eth.exec('Bank').deposit({value: 5, account: 1}),
        delib.eth.exec('Bank').deposit({value: 3, account: 2}),
        delib.eth.exec('Bank').deposit({value: 4, account: 2}),
      ];
      return Promise.all(promises);
    })
    .then(txs => {

      const promises = [
        delib.eth.exec('Bank').withdraw(0, {account: 0}),
        delib.eth.exec('Bank').withdraw(0, {account: 1}),
        delib.eth.exec('Bank').withdraw(0, {account: 2}),
      ];

      console.log('    - Executing withdraw 3 times');

      return Promise.all(promises);
    })
    .then(logs => {
      return delib.eth.events('Bank', 'allEvents', 'all');
    })
    .then(logs => {
      t.equal(logs.length, 12, 'Expect allEvents to return 12 logs');

      return delib.eth.events('Bank', 'depositEvent', 'all');
    })
    .then(logs => {
      t.equal(logs.length, 9, 'Expect the depositEvent to return 9 logs');

      return delib.eth.events('Bank', 'withdrawEvent', 'all');
    })
    .then(logs => {
      t.equal(logs.length, 3, 'Expect withdrawEvent to return 3 logs');

      const filter = {
        event: 'withdrawEvent'
      };

      return delib.eth.events('Bank', 'allEvents', 'all', filter);
    })
    .then(logs => {
      t.equal(logs.length, 3, 'Expect allEvents to return 9 logs with the filter object { event: withdrawEvent }');

      const filter = {
        args: {
          _amount: (amount) => {

            if (Number(amount) === 5) {
              return true;
            } else {
              return false;
            }
          }
        }
      };

      return delib.eth.events('Bank', 'depositEvent', 'all', filter);
    })
    .then(logs => {
      const web3 = delib.eth.init();

      t.equal(logs.length, 2, 'Expect depositEvent to return 2 logs with the filter object { args: { _amount: callback for 5 } }');

      const filter = {
        args: {
          _user: [web3.eth.accounts[0], web3.eth.accounts[1]],
          _amount: (amount) => {
            if (Number(amount) === 3) {
              return true;
            } else {
              return false;
            }
          }
        }
      };

      return delib.eth.events('Bank', 'depositEvent', 'all', filter);
    })
    .then(logs => {
      t.equal(logs.length, 2, 'Expect depositEvent to return 2 logs with the filter object { args: { _user: [acc0, acc1], _amount: callback for 3 } }');

      t.end();
    })
    .catch(err => {
      console.error(err);
      t.fail();
    });
});

test('Watching for Bank contract event logs', t => {
  const depositLogs = [];
  const withdrawLogs = [];

  const web3 = delib.eth.init();
  delib.eth.deploy('Bank')
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

      delib.eth.watch('Bank', 'depositEvent', filter, (err, log) => {
        if (err) {
          console.error(err);
          t.fail();
        } else {
          depositLogs.push(log);
        }

      });

      delib.eth.watch('Bank', 'withdrawEvent', filter, (err, log) => {
        console.log(log);
        if (err) {
          console.error(err);
          t.fail();
        } else {
          withdrawLogs.push(log);
        }
      });

      console.log('  - Performing deposits and withdraws');

      return delib.eth.exec('Bank').deposit({value: 10});
    })
    .then((tx) => {
      return delib.eth.exec('Bank').withdraw(10);
    })
    .then((tx) => {
      return delib.eth.exec('Bank').deposit({value: 3});
    })
    .then((tx) => {
      return delib.eth.exec('Bank').deposit({value: 4});
    })
    .then((tx) => {
      return delib.eth.exec('Bank').withdraw(4);
    })
    .then((tx) => {
      return delib.eth.exec('Bank').withdraw(3);
    })
    .then((tx) => {
      t.equal(depositLogs.length, 2, 'Expect 2 deposit logs');
      t.equal(Number(depositLogs[0].args._amount), 3, 'Expect 1st deposit to have an amount of 3');
      t.equal(Number(depositLogs[1].args._amount), 4, 'Expect 2nd deposit to have an amount of 4');

      t.equal(withdrawLogs.length, 2, 'Expect 2 withdraw logs');
      t.equal(Number(withdrawLogs[0].args._amount), 4, 'Expect 1st deposit to have an amount of 4');
      t.equal(Number(withdrawLogs[1].args._amount), 3, 'Expect 2nd deposit to have an amount of 3');
      t.end();
    })
    .catch(err => {
      t.fail();
      console.error(err);
    });
});
