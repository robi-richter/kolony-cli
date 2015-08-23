var path = require('path');
var wrench = require('wrench');
var fs = require('fs');
var extfs = require('extfs');
var os = require('os');
require('shelljs/global');

var self = {
  projectSeedPath: path.join(os.tmpdir(), 'kolony', 'seed'),
  projectSeedRepository: 'https://github.com/KolonyIO/kolony-seed.git',
  moduleSeedPath: path.join(os.tmpdir(), 'kolony', 'module-seed'),
  moduleSeedRepository: 'https://github.com/KolonyIO/kolony-module-example.git',
};

// fetches the project seed to a temp folder
self.fetchProjectSeed = function(callback){
  if (!fs.existsSync(self.projectSeedPath)){
    wrench.mkdirSyncRecursive(self.projectSeedPath);
  }

  // determine if the seed exists
  if (fs.existsSync(path.join(self.projectSeedPath, ".git"))){
    // if yes, just do a pull to ensure it's up to date
    require('simple-git')(self.projectSeedPath)
     .pull(function(error, update) {
        callback(error, self.projectSeedPath);
     });
  }else{
    // else clone it
    require('simple-git')()
      .clone(self.projectSeedRepository, self.projectSeedPath, function(error, status){
          callback(error, self.projectSeedPath);
      })
  }
}

// fetches the module seed to a temp folder
self.fetchModuleSeed = function(callback){
  if (!fs.existsSync(self.moduleSeedPath)){
    wrench.mkdirSyncRecursive(self.moduleSeedPath);
  }

  // determine if the seed exists
  if (fs.existsSync(path.join(self.moduleSeedPath, ".git"))){
    // if yes, just do a pull to ensure it's up to date
    require('simple-git')(self.moduleSeedPath)
     .pull(function(error, update) {
        callback(error, self.moduleSeedPath);
     });
  }else{
    // else clone it
    require('simple-git')()
      .clone(self.moduleSeedRepository, self.moduleSeedPath, function(error, status){
          callback(error, self.moduleSeedPath);
      })
  }
}

// copies the content of the seed project to a folder, if empty
self.copyProjectSeedToFolder = function(destination, callback){
  // check if provided path exists
  if (!fs.existsSync(destination)){
    callback(new Error('project destination does not exist!'));
    return;
  }

  // check if it's empty; if not fail
  if (! extfs.isEmptySync(destination)){
    callback(new Error('project destination is not empty!'));
    return;
  }

  self.fetchProjectSeed(function(error, seedPath){
    if (error){
      callback(error);
      return;
    }

    cp("-r", seedPath+"/*", destination);
    callback();
  })
}

// copies the content of the seed module to a folder, if empty
self.copyModuleSeedToFolder = function(destination, callback){
  // check if provided path exists
  if (!fs.existsSync(destination)){
    callback(new Error('module destination does not exist!'));
    return;
  }

  // check if it's empty; if not fail
  if (! extfs.isEmptySync(destination)){
    callback(new Error('module destination is not empty!'));
    return;
  }

  self.fetchModuleSeed(function(error, seedPath){
    if (error){
      callback(error);
      return;
    }

    cp("-r", seedPath+"/*", destination);
    callback();
  })
}

module.exports = self;
