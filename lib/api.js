var server  = require('./server');
var printer = require('printer');
var uuid    = require('node-uuid');
var colors  = require('colors/safe');

var api = {
  start: function(config) {
    printer.getPrinters().map(function(printer) {
      if (printer.isDefault == true) {
        console.log('[PRINT]', 'default printer:', colors.green(printer.name));
      } else {
        console.log('[PRINT]', 'printer:', printer.name);
      }
    });

    // Use the token set in the config, otherwise use a uuid
    if (config.token) {
      console.warn('[API] starting as:', colors.green(config.token))
    } else {
      config.token = uuid.v4();
      console.warn(colors.yellow('[NOTICE] config.token not set in config.yml, setting random token:', config.token))
    }

    // Use the port set in the config, otherwise use the default
    if (config.hasOwnProperty('port') == false) {
      config.port = 3030 // Default port
    }

    // Use the port set in the config, or use 3030
    server.start(config, function() {
      console.log('started...')
    });
  }
}

module.exports = api
