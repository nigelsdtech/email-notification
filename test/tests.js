'use strict'

const chai              = require('chai'),
      cfg               = require('config'),
      EmailNotification = require('../EmailNotification.js'),
      gmailModel        = require('gmail-model'),
      log4js            = require('log4js'),
      should            = require('chai').should();

// logs

log4js.configure(cfg.log.log4jsConfigs);

var log = log4js.getLogger(cfg.log.appName);
log.setLevel(cfg.log.level);


var gmailParams = {
    mailbox: {
      name:   cfg.mailbox.name,
      userId: cfg.mailbox.userId
    },
    auth: {
      scopes:           cfg.auth.scopes,
      tokenFile:        cfg.auth.tokenFile,
      tokenFileDir:     cfg.auth.tokenFileDir,
      clientSecretFile: cfg.auth.clientSecretFile
    }
}

var processedLabelName  = cfg.appName + '-processed',
    processedLabelId    = null,
    emailFrom           = cfg.email.from,
    emailFromAddress    = cfg.email.fromAddress,
    emailTo             = cfg.email.to,
    emailSubject        = cfg.email.subject,
    gmailSearchCriteria = 'is:unread newer_than:1d from:"' + emailFromAddress + '" subject:"' + emailSubject + '"';



var en = new EmailNotification({
  gmailSearchCriteria: gmailSearchCriteria,
  processedLabelName: processedLabelName,
  gmail: gmailParams,
  log4js: log4js,
  log: {
    level : cfg.log.level
  }
});


var gmailPackageOpts = {
  name             : gmailParams.mailbox.name,
  userId           : gmailParams.mailbox.userId,
  googleScopes     : gmailParams.auth.scopes,
  tokenFile        : gmailParams.auth.tokenFile,
  tokenDir         : gmailParams.auth.tokenFileDir,
  clientSecretFile : gmailParams.auth.clientSecretFile,
  log4js           : log4js,
  logLevel         : cfg.log.level,
  user             : cfg.email.user,
  appSpecificPassword  : cfg.email.password
}

var gmail = new gmailModel(gmailPackageOpts);


var timeout = 10000



/*
 * Pre-tests
 */

before(function (done) {

  this.timeout(timeout);

  gmail.getLabelId ({
    labelName: processedLabelName,
    createIfNotExists: true
  }, function (err, labelId) {
    if (err) throw new Error(err);
    processedLabelId= labelId
    done();
  });
})


/*
 * Post-tests
 */

after(function (done) {

  this.timeout(timeout);

  gmail.deleteLabel ({
    labelId: processedLabelId
  }, function (err) {
    if (err) throw new Error(err);
    done()
  });

});



/*
 * The actual tests
 */

describe('Retrieves the processed label id', function () {

  this.timeout(timeout);


  it('should retrieve the id for a label called ' + processedLabelName, function (done) {
    en.getProcessedLabelId(null, function(err,labelId) {
        labelId.should.equal(processedLabelId);
        done();
    });
  });


});


describe('Correctly identifies an email notification', function () {

  this.timeout(timeout);

  var en,
      processedLabelId,
      newMessageId;


  before(function (done) {


    // Create the label
    gmail.getLabelId ({
      labelName: processedLabelName,
      createIfNotExists: true
    }, function (err, labelId) {

      if (err) throw new Error(err);

      processedLabelId = labelId

      // Create a dummy notification
      gmail.sendMessage ({
        from:    emailFrom,
        to:      emailTo,
        subject: emailSubject,
        body:    'This is some content',
      }, function (err, response) {

        if (err) throw new Error(err);

        newMessageId = response.id

        // Create the email notification object
        en = new EmailNotification({
           gmailSearchCriteria: gmailSearchCriteria,
           processedLabelName: processedLabelName,
           processedLabelId: processedLabelId,
           gmail: gmailParams,
           log4js: log4js,
           log: {
             level : cfg.log.level
           }
        });

        done();
      });
    });
  });

  it('should recognize the notification email has been received', function (done) {
    en.hasBeenReceived(null, function(err, hasBeenReceived) {
      if (err) throw new Error(err);
      hasBeenReceived.should.equal(true);
      done();
    });
  });

  it('should recognize the email hasn\'t been processed yet', function (done) {
    en.hasBeenProcessed(null, function(err, hasBeenProcessed) {
      if (err) throw new Error(err);
      hasBeenProcessed.should.equal(false);
      done();
    });
  });

  it('should apply the processed label and mark the message as read', function (done) {
    en.updateLabels({
      applyProcessedLabel: true,
      markAsRead: true
    }, function(err, message) {
      if (err) throw new Error(err);

      message.should.have.property('labelIds');
      message.labelIds.should.include(processedLabelId);
      message.labelIds.should.not.include('UNREAD');
      done();
    });
  });

  // Cleanup
  after( function (done) {

    gmail.listMessages({
      freetextSearch: gmailSearchCriteria.replace('is:unread','')
    }, function (err, messages) {

      if (err) throw new Error(err);

      log.debug('Cleanup job retrieved %s messages having searched for criteria - %s', messages.length, gmailSearchCriteria);

      var messageIds = [];

      for (var i = 0 ; i < messages.length; i++) {
        messageIds.push(messages[i].id)
      }

      gmail.trashMessages({
        messageIds: messageIds
      }, function(err,responses) {
        if (err) throw new Error(err);
        done();
      });
    });
  });

});

describe('Testing a non-received email notification', function () {

  this.timeout(timeout);

  var en,
      processedLabelId;


  before(function (done) {


    // Create the label
    gmail.getLabelId ({
      labelName: processedLabelName,
      createIfNotExists: true
    }, function (err, labelId) {

      if (err) throw new Error(err);

      processedLabelId = labelId

      // Create the email notification object
      en = new EmailNotification({
         gmailSearchCriteria: 'subject:"Dud email that couldn\'t possibly have been received" is:' + processedLabelName,
         processedLabelName: processedLabelName,
         processedLabelId: processedLabelId,
         gmail: gmailParams,
         log4js: log4js,
         log: {
           level : cfg.log.level
         }
      });

      done();
    });
  });

  it('should recognize the notification email has not been received', function (done) {
    en.hasBeenReceived(null, function(err, hasBeenReceived) {
      if (err) throw new Error(err);
      hasBeenReceived.should.equal(false);
      done();
    });
  });

  it('should recognize the email hasn\'t been processed yet', function (done) {
    en.hasBeenProcessed(null, function(err, hasBeenProcessed) {
      if (err) throw new Error(err);
      hasBeenProcessed.should.equal(false);
      done();
    });
  });


});
