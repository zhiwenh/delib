'use strict';
const promisify = require('es6-promisify');
const pathExists = require('path-exists').sync;
const contracts = require('./contracts');
const path = require('path');
const config = require('./../config/config.js');

/*
  @ contractFiles - array - an array of contract.sol
  @ directoryPath - string - path where contract files are located. Optional. Will be taken from config
*/
module.exports = promisify((contractFiles, contractPath, buildPath, callback) => {
  const fs = require('fs');
  const compile = require('./compile.js');

  contractFiles = contractFiles ? contractFiles : [];
  if (contractFiles.length === 0) {
    contractFiles = fs.readdirSync(path.join(config.projectRoot, contracts.paths.contract));
    contractFiles = contractFiles.filter(contractFile => {
      return contractFile.indexOf('.sol') >= 0;
    }).map(contractFile => {
      return contractFile.split('.').slice(0, -1).join('.')
    });
  }

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
    const fileBuildPath = path.join(buildPath, contractName +'.json');

    fs.writeFileSync(fileBuildPath, contractCompiledString);
  }

  callback(null, contractNames);
});
