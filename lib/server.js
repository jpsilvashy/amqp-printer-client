var mq           = require('./mq');
var events       = require('events');
var colors       = require('colors/safe');
var eventEmitter = new events.EventEmitter();

var server = {
  start: function(config, callback) {
    if (config.rabbitMqUrl) {
      mq.start(config, eventEmitter);
    } else {
      console.warn(colors.yellow('[NOTICE] config.rabbitMqUrl is not set in config.yml, running in stand-alone mode'));
      process.exit(1);
    }
  }
}

module.exports = server;
