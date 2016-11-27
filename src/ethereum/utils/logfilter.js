'use strict';

/**
 * Event log filter. Returns true/false depending on whether or not to keep log
 * @param {Object} log - The event log
 * @param {Object} filter - The filter object
 * @returns {bool}
 */

module.exports = (log, filter) => {
  for (let key in filter) {
    // Log args filter
    if (key === 'args' && typeof filter.args === 'object') {
      for (let key in filter.args) {
        // No filter match
        if (log.args[key] === undefined || filter.args[key] === null) continue;

        // Callback args filter
        if (typeof filter.args[key] === 'function') {
          if (filter.args[key](log.args[key]) !== true) return false;

        // Array args filter
        } else if (typeof filter.args[key] === 'object' && Array.isArray(filter.args[key])) {
          let match = false;
          for (let i = 0; i < filter.args[key].length; i++) {
            if (log.args[key] === filter.args[key][i]) {
              match = true;
              break;
            }
          }
          if (match === false) return false;

        // Key value args filter
        } else if (filter.args[key] !== log.args[key]) {
          return false;
        }
      }
      continue;
    }

    // No filter match
    if (log[key] === undefined || filter[key] === null) continue;

    // Callback filter
    if (typeof filter[key] === 'function') {
      if (filter[key](log[key]) !== true) return false;

    // Array filter
    } else if (typeof filter[key] === 'object' && Array.isArray(filter[key])) {
      let match = false;
      for (let i = 0; i < filter[key].length; i++) {
        if (log[key] === filter[key][i]) {
          match = true;
          break;
        }
      }
      if (match === false) return false;

    // Key value filter
    } else if (filter[key] !== log[key]) {
      return false;
    }
  }

  return true;
};
