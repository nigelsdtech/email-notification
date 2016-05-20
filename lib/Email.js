"use strict"

var method = Email.prototype


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
function Email(hello) {

  console.log('SteveFlag 1 - ' + hello)
  this.hello = hello

  this.sayHello = function() {
    console.log('SteveFlag say %s', hello)
  }
}

method.sayBye = function() {
  console.log('SteveFlag say %s', hello)
}

// export the class
module.exports = Email;
