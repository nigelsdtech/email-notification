'use strict';

const gmailModel = require('gmail-model');

/**
 * A module for checking that a notification email has been received.
 * @module email
 */

// Some object variables
var _gmail,
    _gmailSearchCriteria,
    _message,
    _messageId,
    _processedLabelId,
    _processedLabelName;

/**
 * Email Notification constructor.
 * @param {object} params Params to be passed in
 * @param {object} params.gmail
 * @param {string} params.gmail.clientSecretFile
 * @param {string} params.gmail.googleScopes
 * @param {string} params.gmail.name
 * @param {string} params.gmail.tokenDir
 * @param {string} params.gmail.tokenFile
 * @param {string} params.gmail.userId
 * @param {string} params.gmailSearchCriteria
 * @param {string} params.processedLabelName
 * @param {string} params.processedLabelId (optional)
 *
 * @constructor
 */
function EmailNotification(params) {

  this._gmailSearchCriteria = params.gmailSearchCriteria
  this._processedLabelName  = params.processedLabelName

  // Load the processed label id if the caller knows it.
  this._processedLabelId = (params.processedLabelId)? params.processedLabelId : null;

  // Setup the google mailbox
  this._gmail = new gmailModel(params.gmail)

  this.flushCache();

}


var method = EmailNotification.prototype;


/**
 * emailNotification.updateLabels
 *
 * @desc Finish off processing by applying the processed label to the email and/or marking it as read
 *
 * @alias emailNotification.updateLabels
 * @memberOf! emailNotification(v1)
 *
 * @param  {object=} params - Parameters for request
 * @param  {boolean} applyProcessedLabel
 * @param  {boolean} markAsRead
 * @param  {callback} callback - The callback that handles the response. Returns callback(error,message)
 * @return {object} message - The message returned by google (would be null if no update was required)
 */
method.updateLabels = function(params, callback) {

  var self = this

  var gParams = {}
  var doUpdate = false;

  if (params.applyProcessedLabel) {
    gParams.addLabelIds = [self._processedLabelId]
    doUpdate = true
  }
  if (params.markAsRead) {
    gParams.removeLabelIds = ['UNREAD']
    doUpdate = true
  }

  gParams.messageId = self._messageId

  if (doUpdate) {

    self._gmail.updateMessage(gParams, function (err, message) {
      if (err) { callback(err); return null }
      callback(null, message)
    });

  } else {
    callback(null, null)
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
 * @param  {object=} params     - Parameters for request (none currently supported)
 * @param  {callback} callback - The callback that handles the response. Returns callback(error,hasBeenProcessed (boolean))
 * @return {boolean} hasBeenProcessed - Indicates whether or not the notification has already been processed
 */
method.hasBeenProcessed = function(params, callback) {

  var self = this

  self.getMessage(null, function (err, message) {

    if (err) { callback(err); return null }

    // If the message doesn't even exist, we say it hasn't been processed
    if (!message) {
      callback(null,false)
      return null
    }

    // Otherwise, get the processed labelId
    self.getProcessedLabelId(null, function (err, labelId) {

      if (err) { callback(err); return null }

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

  // If we have the messageId in memory, we know it's been received
  if (self._messageId != 'empty') {
    callback(null, true)
    return null
  }

  // Try receiving the messageId and return false if it doesn't exist
  self.getMessageId(null, function (err, messageId) {

    if (err) { callback(err); return null }

    if (self._messageId == 'empty') {
      // No messageId retrieved means we haven't received the message
      callback(null, false)
    } else {
      callback(null, true)
    }

  });
}

/**
 * emailNotification.flushCache
 *
 * @desc Flush local cache
 *
 * @alias emailNotification.flushCache
 * @memberOf! emailNotification(v1)
 *
 * @param  {object=} params - Parameters for request (currently unused)
 */
method.flushCache = function(params, callback) {
  this._messageId = "empty"
  this._message   = "empty"
}



/**
 * emailNotification.getMessage
 *
 * @desc Get the gmail message
 *
 * @alias emailNotification.getMessage
 * @memberOf! emailNotification(v1)
 *
 * @param  {object=} params - Parameters for request (currently unused)
 * @param  {callback} callback - The callback that handles the response. Returns callback(error,message (object))
 * @return {string} message - The gmail message resource
 */
method.getMessage = function(params, callback) {

  var self = this

  // Check if it has already been retrieved and stored locally.
  if (self._message != 'empty') {
    callback(null, self._message);
    return null
  }


  // Not in memory. Get the message from google.
  self.getMessageId (null, function (err, messageId) {

    // The message doesn't exist
    if (!messageId) {
      callback(null,null)
      return null;
    }

    self._gmail.getMessage({
      messageId: self._messageId
    }, function (err,message) {
      // Store the retrieved message
      if (err) { callback(err); return null; }
      self._message = message;
      callback(null, message)
    })
  });

}

/**
 * emailNotification.getMessageId
 *
 * @desc Get the gmail message Id. Doesn't actually load the message
 *
 * @alias emailNotification.getMessageId
 * @memberOf! emailNotification(v1)
 *
 * @param  {object=} params - Parameters for request (currently unused)
 * @param  {callback} callback - The callback that handles the response. Returns callback(error,message (object))
 * @return {number} id - The gmail message id
 */
method.getMessageId = function(params, callback) {

  var self = this

  // Check if we already have it in memory and return that
  if (self._messageId != 'empty') {
    callback(null, self._messageId);
    return null
  }

  // Not in memory. Load it.
  self._gmail.listMessages({
    freetextSearch: self._gmailSearchCriteria,
    maxResults: 1
  }, function (err,response) {

    if (err) { callback(err); return null; }

    if (response.length == 1) {
      self._messageId = response[0].id
      callback(null, self._messageId)
      return null
    } else {
      callback(null, null)
      return null
    }

  });

}

/**
 * emailNotification.getProcessedLabelId
 *
 * @desc Get the gmail label ID for the specified label
 *
 * @alias emailNotification.getProcessedLabelId
 * @memberOf! emailNotification(v1)
 *
 * @param  {object=} params - Parameters for request (currently unused)
 * @param  {callback} callback - The callback that handles the response. Returns callback(error,labelId (string))
 * @return {string} labelId - The gmail label Id
 */
method.getProcessedLabelId = function(params, callback) {

  var self = this

  // Get the label ID
  if (!self._processedLabelId) {

    // It hasn't been saved yet. Get it from google.
    self._gmail.getLabelId({
      labelName: self._processedLabelName,
      createIfNotExists: true
    }, function (err,labelId) {

      if (err) { callback(err); return null }

      // Store the retrieved label Id
      self._processedLabelId = labelId;
      callback(null, self._processedLabelId)
    });

  } else {
    // It has already been retrieved and stored locally.
    callback(null, self._processedLabelId)
  }

}


module.exports = EmailNotification;
