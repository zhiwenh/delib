'use strict';
const fs = require('fs');
const path = require('path');
const config = require('./../config/config.js');
const solc = require('solc' + config.solc.version);

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

  let input;
  if (Number(config.solc.version.split('')[2]) === 4) {
    input = {};

    contractFiles.forEach(function(contract) {
      if (!contract.endsWith('.sol')) contract += '.sol';
      const contractPath = directoryPath + contract;
      input[contract] = {content: null};
      input[contract] = fs.readFileSync(contractPath, 'UTF-8');
    });
  } else if (config.solc.version === '0.5.0') {
    input = {
      language: 'Solidity',
      sources: {},
      settings: {
        outputSelection: {
          '*': {
              '*': ['*'],
          },
        },
      },
    };

    contractFiles.forEach(function(contract) {
      if (!contract.endsWith('.sol')) contract += '.sol';
      const contractPath = directoryPath + contract;
      input.sources[contract] = {content: null};
      input.sources[contract].content = fs.readFileSync(contractPath, 'UTF-8');
    });
  } else {
    input = {
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
  }

  function findImports(_path) {
    if (_path[0] === '.') {
      return {
          contents: fs.readFileSync(path.join(directoryPath, _path)).toString()
      }
    } else {
      return {
          contents: fs.readFileSync(path.join(config.projectRoot, 'node_modules', _path)).toString()
      }
    }
  }

  let output;

  if (Number(config.solc.version.split('')[2]) === 4) {
    output = solc.compile({sources: input}, findImports);
  } else if (config.solc.version === '0.5.0') {
    try {
      output = JSON.parse(solc.compile(JSON.stringify(input)), 1, findImports);
    } catch (e) {
      console.log(e);
    }
  } else if (Number(config.solc.version.split('')[2]) === 5) {
    output = JSON.parse(solc.compile(JSON.stringify(input), findImports));
  } else {
    output = JSON.parse(solc.compile(JSON.stringify(input), {import: findImports}));
  }

  if (output.errors) {
    console.log(output.errors);
  }

  if (Number(config.solc.version.split('')[2]) === 4) {
    const contractsCompiled = {};

    for (let contractFileName in output.contracts) {
      const contractName = contractFileName.slice(contractFileName.indexOf(':') + 1);
      const out = output.contracts[contractFileName];
      contractsCompiled[contractName] = {};
      contractsCompiled[contractName].contractName = contractName;
      contractsCompiled[contractName].abi = JSON.parse(out.interface);
      contractsCompiled[contractName].metadata = out.metadata;
      contractsCompiled[contractName].bytecode = out.bytecode;
    }

    return contractsCompiled;
  } else {
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
      }
    }

    return contractsCompiled;
  }
};
