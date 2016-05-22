'use strict';

/**
 * A module for checking that a notification email has been received.
 * @module email
 */

var hello = "default"

/**
 * Email constructor.
 * @param {object} params Params to be passed in
 * @constructor
 */
function FiredTriggerCheck(h) {

  console.log('Invoking email constructor with - ' + h)
  this.hello = h

}

FiredTriggerCheck.prototype.sayHello = function() {
  console.log('SteveFlag say %s', this.hello)
}
  
module.exports = FiredTriggerCheck;
