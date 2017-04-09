var router = require('./router');
var colors = require('colors');
var printer = require('printer');
var amqp   = require('amqplib/callback_api');

// if the connection is closed or fails to be established at all, we will reconnect
var eventEmitter = null;
var amqpConn = null;
var pubChannel = null;
var offlinePubQueue = [];

//
var print = {

  url: function(url, callback) {
    console.log(colors.green('[PRINT]'), "url:", url);
    callback(null, true);
  },

  raw: function(data, callback) {
    // https://github.com/tojocky/node-printer/blob/master/examples/print_raw.js
    printer.printDirect({
      data: data, // or simple String: "some text"
    	//, printer: 'Foxit Reader PDF Printer' // printer name, if missing then will print to default printer
    	type: 'RAW', // type: RAW, TEXT, PDF, JPEG, .. depends on platform
    	success: function(jobID) {
    		console.log(colors.green('[PRINT]'), 'raw, sent to printer with ID:', jobID);
        callback(null, jobID);
    	},
      error:function(err) {
        console.log(colors.red('[ERROR]', err));
        callback(err);
      }
    });
  },

  base64: function(data, callback) {
    console.log(colors.green('[PRINT]'), "base64:", data);
    callback(null, true);
  },

}

module.exports = print;
