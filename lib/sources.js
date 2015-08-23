var async = require('async');
var clui = require('clui');
var self = {
  npm: require('./sources/npm.js'),
  github: require('./sources/github.js'),
  bitbucket: require('./sources/bitbucket.js')
}

// searches on all available sources
self.search = function(term, callback, cli){
    var searchCalls = [];
    var results = [];

    // npm
    searchCalls.push(function(callback){
      if (cli){
        var npmSpinner = new clui.Spinner("searching for '"+term+"' on NPM");
        npmSpinner.start();
      }
      self.npm.search(term, function(error, npmResults){
        if (cli) npmSpinner.stop();

        if (error) return callback(error);

        console.log("npm matched "+npmResults.length+" repositories");
        results = results.concat(npmResults);
        callback();
      })
    });

    // github
    searchCalls.push(function(callback){
      if (cli){
        var gitSpinner = new clui.Spinner("searching for '"+term+"' on GitHub");
        gitSpinner.start();
      }
      self.github.search(term, function(error, githubResults){
        if (cli) gitSpinner.stop();
        if (error) return callback(error);

        console.log("github matched "+githubResults.length+" repositories");
        results = results.concat(githubResults);
        callback();
      })
    });

    // bitbucket only if has credentials
    if (self.bitbucket.hasCredentials){
      searchCalls.push(function(callback){
        if (cli){
          var bitbucketSpinner = new clui.Spinner("searching for '"+term+"' on BitBucket");
          bitbucketSpinner.start();
        }
        self.bitbucket.search(term, function(error, bitbucketResults){
          if (cli) bitbucketSpinner.stop();

          if (error) return callback(error);

          console.log("bitbucket matched "+bitbucketResults.length+" repositories");
          results = results.concat(bitbucketResults);
          callback();
        })
      });
    }

    async.series(searchCalls, function(error){
      if (error) return callback(error);

      callback(null, results);
    })
}

module.exports = self;
