'use strict'

const chai              = require('chai'),
      cfg               = require('config'),
      emailer           = require('emailjs'),
      EmailNotification = require('../EmailNotification.js'),
      gmailModel        = require('gmail-model'),
      log4js            = require('log4js');

// logs

log4js.configure(cfg.get('log.log4jsConfigs'));

var log = log4js.getLogger(cfg.get('log.appName'));
log.setLevel(cfg.get('log.level'));



var assert = chai.assert

var gmailParams = {
    mailbox: {
      name:   'Personal',
      userId: 'me'
    },
    auth: {
      scopes:           'https://www.googleapis.com/auth/gmail.modify',
      tokenFile:        'access_token_email-notification.json',
      tokenFileDir:     '/home/nigelsd/.credentials/',
      clientSecretFile: '/home/nigelsd/.credentials/client_secret.json'
    }
}

var en = new EmailNotification({
  gmailSearchCriteria: 'is:unread',
  processedLabelName: 'email-notification-test',
  gmail: gmailParams,
  log4js: log4js,
  log: {
    level : cfg.get('log.level')
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
  logLevel         : cfg.get('log.level')
}


var gmail = new gmailModel(gmailPackageOpts);




describe('Retrieves the processed label id', function () {

  var newLabelId;
  
  before(function (done) {
  
    gmail.getLabelId ({
      labelName: 'email-notification-test',
      createIfNotExists: true
    }, function (err, labelId) {
      if (err) throw new Error(err);
      newLabelId = labelId
      done()
    });


  });
  
  it('should retrieve the id for a label called email-notification-test', function (done) {
  
      this.timeout(600000);
      en.getProcessedLabelId(null, function(err,labelId) {
          assert.equal(err, null)
          assert.equal(labelId, newLabelId);
          done();
      });
  });


  after(function (done) {
  
    gmail.deleteLabel ({
      labelId: newLabelId
    }, function (err) {
      if (err) throw new Error(err);
      done()
    });

  });

});
