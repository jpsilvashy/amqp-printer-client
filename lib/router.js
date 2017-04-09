var colors = require('colors/safe');
var print = require('./print');

var router = {
  handleMessage: function(message, callback) {
    var content = JSON.parse(message.content.toString());

    if (content.type == 'url') {
      print.url(content.value, function(err, ok) {
        if (err) { callback(false) };
        callback(true);
      });
    }

    else if (content.type == 'raw') {
      print.raw(content.value, function(err, ok) {
        if (err) { callback(false) };
        callback(true);
      });
    }

    else if (content.type == 'base64') {
      print.base64(content.value, function(err, ok) {
        if (err) { callback(false) };
        callback(true);
      });
    }

    else {
      console.log(colors.red('[ERROR]'), 'error handingling message, type:', content.type);
      callback(false);
    }

  }
}

module.exports = router;
