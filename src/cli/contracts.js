'use strict';
const path = require('path');
const fs = require('fs');
const optionActions = require('./optionActions');
const eth = require('./../ethereum/ethereum');
const config = require('./../config/config');

/**
 * Displays built contracts
 */
module.exports = (options) => {
  optionActions(options, 'none');
  const builtPath = path.resolve(config.projectRoot, config.paths.built);
  let contracts = fs.readdirSync(builtPath);
  contracts = contracts.filter(contract => {
    return contract.endsWith('.sol.js');
  }).map(contract => {
    return path.parse(contract).name;
  }).map(contract => {
    return path.parse(contract).name;
  });

  if (contracts.length === 0) {
    console.log('No built contracts');
  } else {
    console.log('Built contracts:', contracts.join(','));
  }

};
