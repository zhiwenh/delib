'use strict';
const promisify = require('es6-promisify');
const pathExists = require('path-exists').sync;
const path = require('path');
/*
  @ contractFiles - array - an array of contract.sol
  @ directoryPath - string - path where contract files are located. Optional. Will be taken from config
*/
module.exports = promisify((contractFiles, contractPath, buildPath, callback) => {
  const fs = require('fs');
  const compile = require('./compile.js');
  const contractsCompiled = compile(contractFiles, contractPath);
  // Make built folder if it doesn't exist
  if (!pathExists(buildPath)) {
    fs.mkdirSync(buildPath);
  }

  let contractNames = [];

  for (let contractName in contractsCompiled) {
    const contractCompiled = contractsCompiled[contractName];
    const contractCompiledString = JSON.stringify(contractCompiled, null, ' ');

    contractNames.push(contractName);
    const fileBuildPath = path.join(buildPath, contractName.slice(0, -4) + '.json');

    fs.writeFileSync(fileBuildPath, contractCompiledString);
  }

  contractNames = contractNames.map(contractName => {
    return contractName.split('.').slice(0, -1).join('.')
  });

  callback(null, contractNames);
});
