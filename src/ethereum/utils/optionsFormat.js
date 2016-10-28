'use strict';

/**
 * Formats your transaction options to a desired type.
 * @param {Object} options - The options you are looking to reformat
 * @param {Object} formatTypes - An object where the values are the type you want to format to. Types: string, number
 */

const optionsType = {
  from: 'string',
  to: 'string',
  value: 'number',
  gas: 'number',
  gasPrice: 'number',
  data: 'string',
  nonce: 'number'
};

module.exports = (options) => {
  for (let key in options) {
    // Put everything that needs to be numbers into numbers
    if (optionsType.hasOwnProperty(key) && typeof options[key] !== optionsType[key]) {

      if (optionsType[key] === 'string' && optionsType[key] === 'number') {
        options[key] = Number(options[key]);
      }

      if (optionsType[key] === 'number' && optionsType[key] === 'string') {
        options[key] = options[key].toString();
      }
    }
  }
  return options;
};
