var cfg   = require('config');
var defer = require('config/defer').deferConfig;

module.exports = {

  appName: 'email-notification',

  auth: {
    credentialsDir:   process.env.HOME+"/.credentials",
    clientSecretFile: defer( function (cfg) { return cfg.auth.credentialsDir+"/client_secret.json" } ),
    tokenFileDir:     defer( function (cfg) { return cfg.auth.credentialsDir } ),
    tokenFile:        defer( function (cfg) { return "access_token_"+cfg.appName+"-"+process.env.NODE_ENV+".json" } ),
    scopes:           ["https://www.googleapis.com/auth/gmail.modify"]
  },

  log: {
    appName: defer(function (cfg) { return cfg.appName } ),
    level:   "INFO",
    log4jsConfigs: {
      appenders: [
        {
          type:       "file",
          filename:   defer(function (cfg) { return cfg.log.logDir.concat("/" , cfg.appName , ".log" ) }),
          category:   defer(function (cfg) { return cfg.appName }),
          reloadSecs: 60,
          maxLogSize: 1024000
        },
        {
          type: "console"
        }
      ],
      replaceConsole: false
    },
    logDir: "./logs"
  },

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
  }

}
