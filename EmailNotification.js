'use strict';

/**
 * A module for checking that a notification email has been received.
 * @module email
 */

// Some object variables
var _gmailSearchCriteria,
    _labelId,
    _message,
    _processedLabelName

/**
 * Email Notification constructor.
 * @param {object} params Params to be passed in
 * @constructor
 */
function EmailNotification(params) {

  this._gmailSearchCriteria = params.gmailSearchCriteria
  this._processedLabelName  = params.processedLabelName

}


var method = EmailNotification.prototype;


/**
 * emailNotification.hasBeenReceived
 *
 * @desc Checks that an email has been received. Doesn't actually retrieve/open the email.
 *
 * @alias emailNotification.hasBeenRecieved
 * @memberOf! emailNotification(v1)
 *
 * @param  {object=} params - Parameters for request (none currently supported)
 * @param  {callback} cb - The callback that handles the response. Returns callback(error,hasBeenReceived (boolean))
 * @return {boolean} hasBeenReceived - Indicates whether or not the notification has been received
 */
method.hasBeenReceived = function(params, cb) {

  // Look for the notification
  var self = this

  gmail.listMessages({
    freetextSearch: self._gmailSearchCriteria,
    maxResults: 1
  }, function (messages) {

    if (messages.length == 1) {
      self._message = messages[0]
      callback(null, true)
      return null
    } else {
      callback(null, false)
      return null
    }

  });
}

/**
 * emailNotification.hasBeenProcessed
 *
 * @desc Checks that the email has been processed (i.e. the processed label has been applied to it.
 *
 * @alias emailNotification.hasBeenProcessed
 * @memberOf! emailNotification(v1)
 *
 * @param  {object=} params - Parameters for request (none currently supported)
 * @param  {callback} cb - The callback that handles the response. Returns callback(error,hasBeenProcessed (boolean))
 * @return {boolean} hasBeenProcessed - Indicates whether or not the notification has already been processed
 */
method.hasBeenProcessed = function(params, cb) {

  var self = this


  function checkForLabel (cb) {

    if (this._message)
  }


  // Get the label ID
  if (typeof _labelId === 'undefined') {

    // It hasn't been saved yet. Get it from google.

    gmail.getLabelId({
      labelName: emailProcessedLabel,
      createIfNotExists: true
    }, function (err,labelId) {

      if (err) {
        callback(new Error(err))
        return null
      }

      // Store the processed label Id
      self._labelId = labelId;
    }

  }

}

/**
 * emailNotification.get
 *
 * @desc Gets the notification email.
 *
 * @alias emailNotification.get
 * @memberOf! emailNotification(v1)
 *
 * @param  {object=} params - Parameters for request (none currently supported)
 * @param  {callback} cb - The callback that handles the response. Returns callback(error,message)
 * @return {object} message - gmail API message object
 */
method.get = function(params, cb) {

    notificationMessageId = this._message.id;

    var isNotified,
        isProcessed;

    if (applyLabelToProcessedEmail || markEmailAsRead) {
      gmail.getMessage({
        messageId: messageId
      }, function (message) {

        log.trace('Message:')

        var parts = message.payload.parts
        log.trace('Message: ' + JSON.stringify(parts))

        // If the message has already been processed we take a quick
        // return and tell the program to go no further.
        if (applyLabelToProcessedEmail) {


            // Check if this message has already been processed
            if (message.labelIds.indexOf(labelId) != -1) {
              log.info('Notification email already processed. Going no further')
              isNotified = null,
              isProcessed = true
              callback(null,isNotified,isProcessed)
              return null
            } else {
              log.debug('Label %s not applied', labelId);
              isNotified = true
              isProcessed = false
              callback(null,isNotified,isProcessed)
              return null
            }
          })
        } else {
          isNotified = true
          isProcessed = false
          callback(null,isNotified,isProcessed)
        }

      });

};

module.exports = EmailNotification;
