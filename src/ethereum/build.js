'use strict';
const promisify = require('es6-promisify');
const pathExists = require('path-exists').sync;
/*
  @ contractFiles - array - an array of contract.sol
  @ directoryPath - string - path where contract files are located. Optional. Will be taken from config
*/
module.exports = promisify((contractFiles, contractPath, buildPath, callback) => {
  const Pudding = require('ether-pudding');
  const fs = require('fs');
  const compile = require('./compile.js');
  const contractsCompiled = compile(contractFiles, contractPath);
  // Make built folder if it doesn't exist
  if (!pathExists(buildPath)) {
    fs.mkdirSync(buildPath);
  }
  Pudding.saveAll(contractsCompiled, buildPath)
    .then(() => {
      const contractNames = [];
      for (let contractName in contractsCompiled) {
        contractNames.push(contractName);
      }
      callback(null, contractNames);
    })
    .catch((err) => {
      throw new Error(err);
    });
});
