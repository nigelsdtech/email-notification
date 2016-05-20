'use strict';

/**
 * A module for checking that a trigger has been fired.
 * For example, that a certain notification email has been received.
 * @module fired-trigger-check
 */

/**
 * Load the apis from apis index file
 * This file holds all version information
 * @private
 */
var apis = require('../apis');

/**
 * TriggerCheckApis constructor.
 * @param {object} options Options to be passed in
 * @constructor
 */
function FiredTriggerApis(options) {
  this.options(options);
  this.addAPIs(apis);
}

/**
 * Add APIs endpoints
 * E.g. firedTriggerCheck.email
 *
 * @param {Array} apis Apis to be added
 * @private
 */
FiredTriggerApis.prototype.addAPIs = function(apis) {
  for (var apiName in apis) {
    this[apiName] = apis[apiName].bind(this);
  }
};

var firedTriggerCheck = new FiredTriggerApis();

/**
 * Exports googleapis.
 */
module.exports = firedTriggerCheck;
