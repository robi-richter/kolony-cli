var npm = require('npm');
var self = {};

self.search = function(term, callback){
  npm.load({}, function(error, data){
    if (error) return callback(error);
    var results = [];
    npm.commands.search(term, true,function(error, data){
      Object.keys(data).forEach(function(npmName){
        var npmPackage = data[npmName];
        results.push({
          type: 'npm',
          name: npmName,
          package: npmPackage
        });
      });

      callback(null, results);
    });
  })
}

module.exports = self;
