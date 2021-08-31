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

test('Should be able to connect to ipc', t => {
  delib.initIPC()

  // delib.isConnected()
  //   .then(status => {
  //     t.equal(status, true, 'Expect connection status to true')
  //     t.end();
  //   })
  //   .catch(err => {
  //     console.error(err);
  //     t.fail();
  //   });
});
