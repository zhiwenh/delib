'use strict';
const optionActions = require('./optionActions');
const eth = require('./../ethereum/ethereum');

/** Outputs display for input abi */
function inputAbi(abi, name) {
  if (abi.inputs.length > 0) {
    process.stdout.write('  - ' + name + ': [ ');
    abi.inputs.forEach((input, i) => {
      process.stdout.write(input.type);
      (i < abi.inputs.length - 1) ? process.stdout.write(', ') : process.stdout.write(' ]');
    });
  }
}

/** Outputs displays for putput abi */
function outputAbi(abi, name) {
  if (abi.outputs.length > 0) {
    process.stdout.write('  - ' + name + ': [ ');
    abi.outputs.forEach((output, i) => {
      process.stdout.write(output.type);
      (i < abi.outputs.length - 1) ? process.stdout.write(', ') : process.stdout.write(' ]');
    });
  }
}

module.exports = (contractName, options) => {
  optionActions(options);
  const contractInstance = eth.builtContract(contractName);
  const abis = contractInstance.abi;
  console.log('  ');
  console.log('  Contract:', contractName);
  console.log('  ');

  let methods = false;
  let constructorIndex;
  abis.forEach((abi, i) => {
    if (abi.type === 'constructor') {
      constructorIndex = i;
    }

    if (abi.type === 'function') {
      if (methods === false) {
        console.log('  Methods:');
        methods = true;
      }
      process.stdout.write('    ' + abi.name);
      inputAbi(abi, 'inputs');
      outputAbi(abi, 'outputs');

      if (abi.constant) {
        process.stdout.write('  - constant');
      }

      if (abi.payable) {
        process.stdout.write('  - payable');
      }

      process.stdout.write('\n');
    }
    if (i >= abis.length - 1) console.log('  ');
  });

  if (constructorIndex) {
    console.log('  Constructor:');
    process.stdout.write('    ' + contractName);
    const abi = abis[constructorIndex];
    inputAbi(abi, 'inputs');
    process.stdout.write('\n');
    console.log('  ');
  }

  let events = false;
  abis.forEach((abi, i) => {
    if (abi.type === 'event') {
      if (events === false) {
        console.log('  Events:');
        events = true;
      }
      process.stdout.write('    ' + abi.name);
      inputAbi(abi, 'args');
      process.stdout.write('\n');
    }
    if (i >= abis.length - 1) console.log('  ');
  });

  console.log('  Address:', eth.contracts.addresses.get(contractName));
  console.log('');

};
