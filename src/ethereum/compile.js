'use strict';
const fs = require('fs');
const solc = require('solc'); // https://github.com/ethereum/solc-js
const path = require('path');
const config = require('./../config/config.js');
/**
* Creates object containing necessary information for web3 contract creation, writes it to a JSON file, and also for ether-pudding building
* @contractFiles {String} or {Array} - the contract names to build
* @directoryPath {String} - the directory to look for the contracts
* @return {Object} - contract object
**/
module.exports = (contractFiles, directoryPath) => {
  // to handle cases when there's no array of contract files, only contract file
  if (typeof contractFiles === 'string') {
    contractFiles = [contractFiles];
  }
  if (!directoryPath) directoryPath = config.paths.contract;
  if (directoryPath[directoryPath.length - 1] !== '/') directoryPath += '/';

  const input = {};
  contractFiles.forEach(function(contract) {
    if (!contract.endsWith('.sol')) contract += '.sol';
    const contractPath = directoryPath + contract;
    input[contract] = fs.readFileSync(contractPath).toString();
  });

  const output = solc.compile({sources: input}, 1);

  // console.log('in compile, Object.keys(output.contracts)', Object.keys(output.contracts));
  // console.log('in compile, output');
  // console.log(output);

  if (output.errors) {
    throw new Error('Unable to compile Solidity contract: ' + JSON.stringify(output.errors));
  }

  // to have contract data in the proper format
  const contractsCompiled = {};
  for (let contractName in output.contracts) {
    const out = output.contracts[contractName];

    contractName = contractName.substring(contractName.indexOf(':') + 1, contractName.length);
    contractsCompiled[contractName] = {};

    // for ether-pudding
    contractsCompiled[contractName].unlinked_binary = out.bytecode;
    contractsCompiled[contractName].abi = JSON.parse(out.interface);

    // for web3
    contractsCompiled[contractName].code = out.bytecode;
    contractsCompiled[contractName].runtimeBytecode = out.runtimeBytecode;
    contractsCompiled[contractName].info = {};
    contractsCompiled[contractName].info.abiDefinition = JSON.parse(out.interface);

  }

  return contractsCompiled;
};
