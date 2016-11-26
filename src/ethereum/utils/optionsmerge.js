'use strict';
/**
 * Function for transaction options. Gives options the properties that mergeOptions has but it doesnt.
 */

module.exports = (mergeOptions, options) => {
  if (typeof options !== 'object' || Array.isArray[options]) {
    options = Object.assign({}, mergeOptions);
  } else {
    options = Object.assign({}, options);
    /** Combines the objects */
    for (let key in mergeOptions) {
      if (!options.hasOwnProperty(key)) {
        options[key] = mergeOptions[key];
      }
    }
  }

  return options;
};
