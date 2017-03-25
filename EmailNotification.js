'use strict';

var gmailModel = require('gmail-model');

/**
 * A module for checking that a notification email has been received.
 * @module email
 */

// Some object variables
var
    _gmail,
    _gmailSearchCriteria,
    _messages,
    _messageIds,
    _metadataHeaders,
    _processedLabelId,
    _processedLabelName,
    _retFields;

/**
 * Email Notification constructor.
 * @param {object}   params Params to be passed in
 * @param {string=}  params.format - 'full', 'metadata', 'minimal' or 'raw'
 * @param {object}   params.gmail
 * @param {string}   params.gmail.clientSecretFile
 * @param {string}   params.gmail.googleScopes
 * @param {string}   params.gmail.name
 * @param {string}   params.gmail.tokenDir
 * @param {string}   params.gmail.tokenFile
 * @param {string}   params.gmail.userId
 * @param {string}   params.gmailSearchCriteria
 * @param {integer]} params.maxResults - Maximum number of results to be returned
 * @param {string[]} params.metaDataHeaders - which message headers to return
 * @param {string}   params.processedLabelName
 * @param {string}   params.processedLabelId (optional)
 * @param {string}   params.retFields - message fields to be returned for each message
 *
 * @constructor
 */
function EmailNotification(params) {

  this._gmailSearchCriteria = params.gmailSearchCriteria
  this._processedLabelName  = params.processedLabelName
  this._maxResults          = params.maxResults

  // Load the processed label id if the caller knows it.
  this._processedLabelId = (params.processedLabelId)? params.processedLabelId : null;

  // Setup the google mailbox
  this._gmail = new gmailModel(params.gmail)

  this._retFields       = params.retFields
  this._format          = params.format
  this._metadataHeaders = params.metadataHeaders

  this.flushCache();

}


var method = EmailNotification.prototype;


/**
 * emailNotification.flushCache
 *
 * @desc Flush local cache
 *
 * @alias emailNotification.flushCache
 * @memberOf! emailNotification(v1)
 *
 * @param  {object}  params - Parameters for request (currently unused)
 */
method.flushCache = function(params, callback) {
  this._messageIds = null
  this._messages   = null
}



/**
 * emailNotification.getMessages
 *
 * @desc Get the gmail message
 *
 * @alias emailNotification.getMessages
 * @memberOf! emailNotification(v1)
 *
 * @param  {object}  params - Parameters for request (currently unused)
 * @param  {callback} callback - The callback that handles the response. Returns callback(error,message (object))
 * @return {string} message - The gmail message resource
 */
method.getMessages = function(params, callback) {

  var self = this

  // Check if it has already been retrieved and stored locally.
  if (this.isCached('_messages')) {
    callback(null, self._messages);
    return null
  }


  // Not in memory. Get the messages from google.
  self.getMessageIds (null, function (err, messageIds) {

    // The message doesn't exist
    if (!messageIds) {
      callback(null,null)
      return null;
    }

    var gParams = { messageIds: messageIds }

    if (self._retFields       != null && typeof self._retFields       != "undefined") { gParams.retFields       = self._retFields }
    if (self._format          != null && typeof self._format          != "undefined") { gParams.format          = self._format    }
    if (self._metadataHeaders != null && typeof self._metadataHeaders != "undefined") { gParams.metadataHeaders = self._metadataHeaders }

    self._gmail.getMessages(gParams, function (err,messages) {

      if (err) { callback(err); return null; }

      if (messages.length > 0) {

        // Store the retrieved messages
        self._messages = []
        for (var i = 0; i < messages.length; i++) { self._messages.push(messages[i]) }

        callback(null, self._messages)
        return null
      } else {
        callback(null, null)
        return null
      }
    })
  });

}

/**
 * emailNotification.getMessageIds
 *
 * @desc Get the gmail message Id. Doesn't actually load the message
 *
 * @alias emailNotification.getMessageIds
 * @memberOf! emailNotification(v1)
 *
 * @param  {object}  params - Parameters for request (currently unused)
 * @param  {callback} callback - The callback that handles the response. Returns callback(error,message (object))
 * @return {number} id - The gmail message id
 */
method.getMessageIds = function(params, callback) {

  var self = this

  // Check if we already have it in memory and return that
  if (self.isCached('_messageIds')) {
    callback(null, self._messageIds);
    return null
  }

  var gParams = {
    freetextSearch: self._gmailSearchCriteria
  }

  if (self._maxResults) gParams.maxResults = self._maxResults

  // Not in memory. Load it.
  self._gmail.listMessages(gParams, function (err,responses) {

    if (err) { callback(err); return null; }

    if (responses.length > 0) {

      self._messageIds = []
      for (var i = 0; i < responses.length; i++) { self._messageIds.push(responses[i].id) }
      callback(null, self._messageIds)
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
 * @param  {object}  params - Parameters for request (currently unused)
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

/**
 * emailNotification.allHaveBeenProcessed
 *
 * @desc Checks that all the matching emails have been processed (i.e. the processed label has been applied to all emails).
 *
 * @alias emailNotification.allHaveBeenProcessed
 * @memberOf! emailNotification(v1)
 *
 * @param  {object=}  params   - Parameters for request (none currently supported)
 * @param  {callback} callback - The callback that handles the response. Returns callback(error,allHaveBeenProcessed (boolean))
 * @return {boolean}  allHaveBeenProcessed - Indicates whether or not the notification has already been processed
 */
method.allHaveBeenProcessed = function(params, callback) {

  var self = this

  self.getMessages(null, function (err, messages) {

    if (err) { callback(err); return null }

    // If the messages don't even exist, we say it hasn't been processed
    if (!messages) {
      callback(null,false)
      return null
    }

    // Otherwise, get the processed labelId
    self.getProcessedLabelId(null, function (err, labelId) {

      if (err) { callback(err); return null }

      // Check if any of these messages haven't been processed
      var allHaveBeenProcessed = true
      for (var i = 0; i < messages.length; i++) {
        if (messages[i].labelIds.indexOf(labelId) == -1) {
          allHaveBeenProcessed = false
	  break;
        }
      }
      callback(null,allHaveBeenProcessed)

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
 * @param  {object}  params - Parameters for request (none currently supported)
 * @param  {callback} callback - The callback that handles the response. Returns callback(error,hasBeenReceived (boolean))
 * @return {boolean} hasBeenReceived - Indicates whether or not the notification has been received
 */
method.hasBeenReceived = function(params, callback) {

  // Look for the notification
  var self = this

  // If we have the messageIds in memory, we know it's been received
  if (self.isCached()) {
    callback(null, true)
    return null
  }

  // Try receiving the messageIds and return false if it doesn't exist
  self.getMessageIds(null, function (err, messageIds) {

    if (err) { callback(err); return null }
    if (messageIds) { callback(null, true)  } else { callback(null, false) }

  });
}


/**
 * emailNotification.isCached
 *
 * @desc Is the message info cached?
 *
 * @alias emailNotification.isCached
 * @memberOf! emailNotification(v1)
 *
 * @param  {string} info - The info we're looking for (either _messageIds or _messages)
 * @returns {boolean}
 */
method.isCached = function(info) {

  if (this[info]) {return true} else {return false}
}

/**
 * emailNotification.trash
 *
 * @desc Finish off processing by deleting the messages
 *
 * @alias emailNotification.trash
 * @memberOf! emailNotification(v1)
 *
 * @param  {object}  params - Parameters for request (currently unused)
 * @param  {callback} callback - The callback that handles the response. Returns callback(error). If null, the proc will run asyncronously.
 */
method.trash = function(params, callback) {

  var self = this

  if (!callback) {
    callback = function() {return null}
  }

  self._gmail.trashMessages({
    messageIds: self._messageIds
  }, callback);

}


/**
 * emailNotification.updateLabels
 *
 * @desc Finish off processing by applying the processed label to the email and/or marking it as read
 *
 * @alias emailNotification.updateLabels
 * @memberOf! emailNotification(v1)
 *
 * @param  {object}  params - Parameters for request
 * @param  {boolean} applyProcessedLabel
 * @param  {boolean} markAsRead
 * @param  {callback} callback - The callback that handles the response. Returns callback(error,message)
 * @return {object[]} message - The message returned by google (would be null if no update was required)
 */
method.updateLabels = function(params, callback) {

  var self = this

  var gParams = {
    messageId: self._messageIds
  }
  var doUpdate = false;


  if (params.applyProcessedLabel) {
    gParams.addLabelIds = [self._processedLabelId]
    doUpdate = true
  }
  if (params.markAsRead) {
    gParams.removeLabelIds = ['UNREAD']
    doUpdate = true
  }

  if (doUpdate) {
    self._gmail.updateMessage(gParams, function (err, messages) {
      if (err) { callback(err); return null }
      callback(null, messages)
    });

  } else {
    callback(null, self._messages)
  }

}




module.exports = EmailNotification;
