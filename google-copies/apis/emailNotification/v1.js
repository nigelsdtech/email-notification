/* jshint maxlen: false */

'use strict';

/**
 * Email Notification API
 *
 * @classdesc The API to interact with notifications received by email.
 * @namespace emailNotification
 * @version  v1
 * @variation v1
 * @this emailNotification
 * @param {object=} options Options for emailNotification
 */
function emailNotification(options) {

  var self = this;
  this._options = options || {};

  /**
   * emailNotification.hasFired
   *
   * @desc Checks that an email has been received and returns it if so.
   *
   * @alias emailNotification.hasFired
   * @memberOf! emailNotification(v1)
   *
   * @param  {object=} params - Parameters for request (none currently supported)
   * @param  {callback} callback - The callback that handles the response.
   * @return {object} Request object
   */
  this.hasFired = function(params, callback) {

    // Look for the notification
    var gmailSearchCriteria = self._options.gmailSearchCriteria
    
    gmail.listMessages({
      freetextSearch: gmailSearchCriteria,
      maxResults: 1
    }, function (messages) {
    
      if (messages.length == 0) {
        log.info('No messages')
        callback(null,false,null)
        return null
      }
    
      var message   = messages[0],
          messageId = message.id;
      notificationMessageId = messageId;
    
      log.info('Found message:')
      log.info(message)
    
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
    
            gmail.getLabelId({
              labelName: emailProcessedLabel,
              createIfNotExists: true
            }, function (err,labelId) {
    
              if (err) {
                log.error('PaymentData.getPaymentData: Error getting label ID - ' + err)
                callback(new Error(err))
                return null
              }
    
              // Store the processed label Id
              emailProcessedLabelId = labelId;
    
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
    
      } else {
        isNotified = true
        isProcessed = false
        callback(null,isNotified,isProcessed)
      }
    
    });
    var parameters = {
      options: {
        url: 'https://www.googleapis.com/drive/v3/about',
        method: 'GET'
      },
      params: params,
      requiredParams: [],
      pathParams: [],
      context: self
    };

    return createAPIRequest(parameters, callback);
  };

}

/**
 * Exports Drive object
 * @type Drive
 */
module.exports = Drive;
