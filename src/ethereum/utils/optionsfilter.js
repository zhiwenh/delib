'use strict';

const allowedOptions = {
  /** Transaction options */
  from: true,
  to: true,
  value: true,
  gas: true,
  gasPrice: true,
  data: true,
  nonce: true,

  /** delib options */
  accountIndex: true,
  maxGas: true
};

/**
 * Filters out unneeded transaction options
 * @param {Object} options - Transaction options object.
 * @returns {Object} - The filtered options object.
 */
module.exports = (options) => {
  for (let key in options) {
    if (allowedOptions[key] !== true || !options[key]) {
      delete options[key];
    }
  }

  return options;
};
