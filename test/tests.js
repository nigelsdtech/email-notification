'use strict'

const chai              = require('chai'),
      cfg               = require('config'),
      EmailNotification = require('../EmailNotification.js'),
      log4js            = require('log4js');

// logs

log4js.configure(cfg.get('log.log4jsConfigs'));

var log = log4js.getLogger(cfg.get('log.appName'));
log.setLevel(cfg.get('log.level'));



var assert = chai.assert

describe('Retrieves the processed label id', function () {

    var en;

    before(function () {
      en = new EmailNotification({
        gmailSearchCriteria: 'is:unread',
        processedLabelName: 'email-notification-test',
        gmail: {
          mailbox: {
            name:   'Personal',
            userId: 'me'
          },
          auth: {
            scopes:           'https://www.googleapis.com/auth/gmail.modify',
            tokenFile:        'access_token_email-notification.json',
            tokenFileDir:     '/home/nigelsd/.credentials/',
            clientSecretFile: '/home/nigelsd/.credentials/client_secret.json',
          },
        },
        log4js           : log4js,
	log: {
	  level : cfg.get('log.level')
	}
      });
    });


    it('should retrieve the id for a label called email-notification-test', function (done) {

        this.timeout(600000);
        en.getProcessedLabelId(null, function(err,labelId) {
	    console.log('Received label - ' + labelId);
	    assert.equal(err, null)
            assert.equal(labelId, 'hello');
            done();
        });
    });
});
