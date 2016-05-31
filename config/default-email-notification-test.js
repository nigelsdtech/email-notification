var cfg   = require('config');
var defer = require('config/defer').deferConfig;

module.exports = {

  appName: "email-notification-test",

  mailbox: {
      name: "Personal",
      userId: "me"
  },


  email : {
    stubEmail: false,
    user:      process.env.PERSONAL_GMAIL_USERNAME,
    password:  process.env.PERSONAL_APP_SPECIFIC_PASSWORD,
    host:      process.env.GMAIL_SMTP_SERVER,
    ssl:       true,
    from:      "Nigel's Raspberry Pi <"+process.env.PERSONAL_EMAIL+">",
    fromAddress: process.env.PERSONAL_EMAIL,
    to:        process.env.PERSONAL_DISPLAY_NAME+" <"+process.env.PERSONAL_EMAIL + ">",
    subject:   "Auto test: Email Notification Checker"
  },

  log : {
    level: 'INFO',
    replaceConsole: false
  }
} 
