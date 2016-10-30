const delib = require('./../index');

// delib.eth.init();
// delib.eth.initIPC();

// delib.eth.exec('Events').estimate.getNumber({gas: 0, gasPrice: 50})
//   .then(num => {
//     console.log(num);
//   });

// delib.eth.initIPC();

// delib.eth.changeProvider('ipc');

// console.log('connection type', delib.eth.connectionType);

delib.eth.getBalanceEther(0)
  .then(ether => {
    console.log('getBalanceEther', ether);
  })
  .catch(err => {
    console.error(err);
  });

delib.eth.getBalanceWei(0)
  .then(wei => {
    console.log(delib.eth.toEther(wei));
    console.log('getBalanceWei', wei);
  })
  .catch(err => {
    console.error(err);
  });

delib.eth.deploy.estimate('Test', 5)
  .then(gasEstimate => {
    console.log('deploy.estimate Test', gasEstimate);
    return delib.eth.deploy('Test', 5);
  })
  .then(instance  => {
    console.log('delib.eth.deploy Test instance address w/ gas est', instance.address);
    delib.eth.options = {
      value: 0,
      gas: 1000000,
      gaga: '234234'
    };
    console.log('delib.eth.options. No more gas est');
    return delib.eth.deploy('Test', [5, 'hello']);
  })
  .then(instance => {
    console.log('deploy Test instance address w/o gas est', instance.address);
    return delib.eth.exec('Test').estimate.addNumber(50);
  })
  .then(gasEstimate => {
    console.log('delib.eth.exec("Test").estimate.addNumber(50) gas est:', gasEstimate);
    return delib.eth.exec('Test').addNumber(6, {bob2: 'sara', bob: 'apple', gasPrice: 50});
  })
  .then(tx => {
    delib.eth.accountIndex = 1;
    console.log('delib.eth.accountIndex = 1');
    console.log('delib.eth.exec("Test").addNumber(6) w/o gas est tx:', tx);
    return delib.eth.exec('Test').addNumber(7, {gas: 0});
  })
  .then(tx => {
    console.log('delib.eth.exec("Test").addNumber(7) w/ gas est tx:', tx);
    return delib.eth.exec('Test').getNumbers();
  })
  .then(num => {
    console.log('delib.eth.exec("Test").getNumbers() res', num);
    return delib.eth.events('Test', 'numberEvent', 'all');
  })
  .then(logs => {
    console.log("delib.eth.events('Test', 'numberEvent', 'all') logs:", logs);
    return delib.eth.exec('Test').addLetter('a');
  })
  .then(tx => {
    console.log("delib.eth.exec('Events').addLetter('a') tx:", tx);
    return delib.eth.events('Test', 'letterEvent', 'all', {});
  })
  .then(logs => {
    console.log('add letter event', logs);
    delib.eth.closeIPC();
  })
  .catch(err => {
    console.log(err);
    delib.eth.closeIPC();
  });
