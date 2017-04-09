var lib = require('./lib');
var fs = require('fs');
var yaml = require('js-yaml');

var config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));

lib.api.start(config, function(err, ok) {
  console.log(err, ok);
})
