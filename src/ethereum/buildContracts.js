'use strict';
const promisify = require('es6-promisify');
/*
  @ contractFiles - array - an array of contract.sol
  @ directoryPath - string - path where contract files are located. Optional. Will be taken from config
*/
module.exports = promisify((contractFiles, contractPath, buildPath, callback) => {
  console.log('Path to Contracts:', contractPath);
  const Pudding = require('ether-pudding');
  const fs = require('fs');
  const compile = require('./compile.js');
  const contractsCompiled = compile(contractFiles, contractPath);
  Pudding.saveAll(contractsCompiled, buildPath)
    .then(() => {
      const contractNames = [];
      console.log('Contracts Built at:', buildPath);
      for (let contractName in contractsCompiled) {
        contractNames.push(contractName);
      }
      callback(null, contractNames);
    })
    .catch((err) => {
      throw new Error(err);
    });
});
