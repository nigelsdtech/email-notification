'use strict';

/**
 * A module for checking that a trigger has been fired.
 * For example, that a certain notification email has been received.
 * @module fired-trigger-check
 */

/**
 * Email notification module.
 * @returns The email notification module
 */
function Email() {
    console.log('Returning an email')
    return require('./lib/Email.js')
}

/**
 * Exports googleapis.
 */
module.exports.email = Email;
