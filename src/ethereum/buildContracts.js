'use strict';
/*
  @ contractFiles - array - an array of contract.sol
  @ directoryPath - string - path where contract files are located. Optional. Will be taken from config
*/
module.exports = (contractFiles, contractPath, buildPath) => {
  console.log('Path to Contracts:', contractPath);
  const Pudding = require('ether-pudding');
  const fs = require('fs');
  const compile = require('./compile.js');
  const contractsCompiled = compile(contractFiles, contractPath);
  return Pudding.saveAll(contractsCompiled, buildPath)
    .then(() => {
      console.log('Contracts Built at:', buildPath);
      for (let contractName in contractsCompiled) {
        console.log(contractName);
      }
    })
    .catch((err) => {
      console.log('Pudding Save Error');
      console.error(err);
    });
};
