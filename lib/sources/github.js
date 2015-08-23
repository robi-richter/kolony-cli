var GitHubApi = require('github');

var self = {};

// searches for bitbucket repositories
self.search = function(term, callback){
  var results = [];
  var github = new GitHubApi({
    version: "3.0.0",
    timeout: 20000
  });

  github.search.repos({q: term}, function(error, data){
    if (error) return callback(error);

    if (data.items && data.items.length>0){
      data.items.forEach(function(repository){
        console.log(repository.name);
        results.push({
          type: 'github',
          name: repository.full_name,
          repository: repository
        });
      })

      callback(null, results);
    }else{
      return callback();
    }
  })
}

module.exports = self;
