'use strict';

/**
 * A module for checking that a notification email has been received.
 * @module email
 */

// Some object variables
var _gmailSearchCriteria,
    _message,
    _messageId,
    _processedLabelId,
    _processedLabelName;

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
 * emailNotification.finishProcessing
 *
 * @desc Finish off processing by applying the processed label to the email and/or marking it as read
 *
 * @alias emailNotification.finishProcessing
 * @memberOf! emailNotification(v1)
 *
 * @param  {object=} params - Parameters for request
 * @param  {boolean} applyProcessedLabel
 * @param  {boolean} markAsRead
 * @param  {callback} callback - The callback that handles the response. Returns callback(error,isUpdateRequired)
 * @return {boolean} isUpdateRequired - Indicates whether or not an update was required to have been sent to gmail
 */
method.finishProcessing = function(params, callback) {

  var self = this

  var params = {}
  var doUpdate = false;

  if (params.applyProcessedLabel) {
    params.addLabelIds = [self._processedLabelId]
    doUpdate = true
  }
  if (params.markAsRead) {
    params.removeLabelIds = ['UNREAD']
    doUpdate = true
  }

  params.messageId = self._messageId

  if (doUpdate) {

    gmail.updateMessage(params, function (err, message) {
      if (err) {
        callback(err)
        return null
      }
    });

  }
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
 * @param  {callback} callback - The callback that handles the response. Returns callback(error,hasBeenProcessed (boolean))
 * @return {boolean} hasBeenProcessed - Indicates whether or not the notification has already been processed
 */
method.hasBeenProcessed = function(params, callback) {

  var self = this

  // Get the message 
  self.getEmail(function (message) {

    // And get the processed labelId
    self.getLabelId(function (err, labelId) {

      if (err) {
        callback(err)
        return null
      }

      // Check if this message has already been processed
      if (message.labelIds.indexOf(labelId) != -1) {
        callback(null,true)
        return null
      } else {
        callback(null,false)
        return null
      }

    });
  });

}


/**
 * emailNotification.hasBeenReceived
 *
 * @desc Checks that an email has been received. Doesn't actually retrieve/open the email.
 *
 * @alias emailNotification.hasBeenRecieved
 * @memberOf! emailNotification(v1)
 *
 * @param  {object=} params - Parameters for request (none currently supported)
 * @param  {callback} callback - The callback that handles the response. Returns callback(error,hasBeenReceived (boolean))
 * @return {boolean} hasBeenReceived - Indicates whether or not the notification has been received
 */
method.hasBeenReceived = function(params, callback) {

  // Look for the notification
  var self = this

  gmail.listMessages({
    freetextSearch: self._gmailSearchCriteria,
    maxResults: 1
  }, function (messages) {

    if (messages.length == 1) {
      self._messageId = messages[0].id
      callback(null, true)
      return null
    } else {
      callback(null, false)
      return null
    }

  });
}


/**
 * emailNotification.getEmail
 *
 * @desc Get the gmail message
 *
 * @alias emailNotification.getEmail
 * @memberOf! emailNotification(v1)
 *
 * @param  {object=} params - Parameters for request (currently unused)
 * @param  {callback} callback - The callback that handles the response. Returns callback(error,message (object))
 * @return {string} message - The gmail message resource
 */
method.getEmail = function(params, callback) {

  var self = this

  // Get the label ID
  if (typeof self._message === 'undefined') {

    gmail.getMessage({
      messageId: messageId
    }, function (message) {

      // Store the retrieved message
      self._message = message;
      callback(null, message)

    })

  } else {
    // It has already been retrieved and stored locally.
    callback(null, self._message)
  }

}

/**
 * emailNotification.getProcessedLabelId
 *
 * @desc Get the gmail label ID for the specified label
 *
 * @alias emailNotification.getProcessedLabelId
 * @memberOf! emailNotification(v1)
 *
 * @param  {object=} params - Parameters for request
 * @param  {callback} callback - The callback that handles the response. Returns callback(error,labelId (string))
 * @return {string} labelId - The gmail label Id
 */
method.getProcessedLabelId = function(params, callback) {

  var self = this

  // Get the label ID
  if (typeof self._processedLabelId === 'undefined') {

    // It hasn't been saved yet. Get it from google.
    gmail.getLabelId({
      labelName: self._processedLabel,
      createIfNotExists: true
    }, function (err,labelId) {

      if (err) {
        callback(err)
        return null
      }

      // Store the retrieved label Id
      self._processedLabelId = labelId;
      callback(null, _processedLabelId)
    }

  } else {
    // It has already been retrieved and stored locally.
    callback(null, self._processedLabelId)
  }

}


module.exports = EmailNotification;
