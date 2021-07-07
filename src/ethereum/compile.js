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

  const input = {
    language: 'Solidity',
    sources: {},
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };
  contractFiles.forEach(function(contract) {
    if (!contract.endsWith('.sol')) contract += '.sol';
    const contractPath = directoryPath + contract;
    input.sources[contract] = {content: null};
    input.sources[contract].content = fs.readFileSync(contractPath, 'UTF-8');
  });

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    console.log(output.errors);
  }

  console.log('output', output);
  // to have contract data in the proper format
  const contractsCompiled = {};
  for (let contractFileName in output.contracts) {
    const out = output.contracts[contractFileName];

    for (let contractName in out) {
      contractName = contractName.substring(contractName.indexOf(':') + 1, contractName.length);
      contractsCompiled[contractName] = {};
      contractsCompiled[contractName].contractName = contractName;
      contractsCompiled[contractName].abi = out[contractName].abi;

      contractsCompiled[contractName].metadata = out[contractName].metadata;

      contractsCompiled[contractName].bytecode = out[contractName].evm.bytecode.object;

      contractsCompiled[contractName].deployedBytecode = out[contractName].evm.deployedBytecode.object;
      contractsCompiled[contractName].immutableReferences = out[contractName].evm.deployedBytecode.immutableReferences;

      contractsCompiled[contractName].generatedSources = out[contractName].evm.deployedBytecode.generatedSources;
      contractsCompiled[contractName].sourceMap = out[contractName].evm.deployedBytecode.sourceMap;
      contractsCompiled[contractName].devdoc = out[contractName].devdoc;
      contractsCompiled[contractName].userdoc = out[contractName].userdoc;
    }



  }

  return contractsCompiled;
};
