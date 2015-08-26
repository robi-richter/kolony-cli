var environment = require("./environment.js");
var resources = require("./resources.js");
var path = require('path');
var fs = require('fs');
var wrench = require('wrench');
var _ = require('underscore');
var npmi = require('npmi');
var async = require('async');
require('shelljs/global');

var self = {
    projectInfo: undefined,
    currentProject: undefined,
    packageInfo: undefined,
    moduleController: require('./moduleController.js')
}

self.moduleController.setProjectControllerInstance(self);

// reads content of kolony file
self.readKolonyFile = function(){
  self.projectInfo = require(path.join(self.currentProject.path, 'kolony.json'));
}

// reads content of package file
self.readPackageFile = function(){
  self.packageInfo = require(path.join(self.currentProject.path, 'package.json'));
}

// writes the packageInfo to file
self.writePackageFile = function(){
  fs.writeFileSync(path.join(self.currentProject.path, 'package.json'), JSON.stringify(self.packageInfo, null, 4));
}

// checks if the current working
self.cwdIsKolonyProject = function(){
  return fs.existsSync(path.join(process.cwd(), 'kolony.json'));
}

//sets the current project by name, and reads it's info
self.setCurrentProject = function(projectName){
  self.currentProject = environment.getProject(projectName);
  if (self.currentProject){
    self.readKolonyFile();
    self.readPackageFile();
  }
}

// initialises the project controller
self.init = function(cli){
  if (self.currentProject === undefined && cli){
    console.log('no project and cli');
    if (! self.cwdIsKolonyProject()){
      console.log('current working directory is not a kolony project! \n\nplease change directory to a valid kolony project, or use the -p, --project [projectName] option to specify a project \n');
      process.exit(0);
    }

    var kolonyInfo = require(path.join(process.cwd(), 'kolony.json'));
    self.setCurrentProject(kolonyInfo.name);

    self.moduleController.setProjectControllerInstance(self);
  }
}

/// checks if a module exists by it's name
self.moduleExists = function(name){
  if (self.packageInfo && self.packageInfo.dependencies && self.packageInfo.dependencies[name] !== undefined) return true;
  return false;
}

//creates a new kolonty module
self.createModule = function(moduleName, repository, callback){
  var nodeModulesFolder = path.join(self.currentProject.path, 'node_modules');

  // if the node_modules folder is not present in the project, create it
  if (! fs.existsSync(moduleFolder)){
    wrench.mkdirSyncRecursive(nodeModulesFolder);
  }

  // module folder within the node_modules
  var moduleFolder = path.join(nodeModulesFolder, moduleName);

  if (fs.existsSync(moduleFolder)){
    callback(new Error(moduleFolder+' already exists'));
  }

  if (self.moduleExists(moduleName)){
    callback(new Error('module '+moduleName+' already exists'));
  }

  // define the copy script as function so it can be called after git clone
  function initModule(callback){
    console.log('copying content from example');
    resources.copyModuleSeedToFolder(moduleFolder, function(error, data){
      if (error){
        callback(error);
        return;
      }

      // rename the entrypoint file
      mv(path.join(moduleFolder,'example.js'), path.join(moduleFolder, moduleName.replace("kolony-module-", '')+".js"));

      /** remove the example controllers and models **/
      rm("-rf", path.join(moduleFolder, 'controllers'));
      rm("-rf", path.join(moduleFolder, 'models'));
      rm("-rf", path.join(moduleFolder, 'api'));
      rm(path.join(moduleFolder, 'config/example.json'));

      /** placeholder that need to be replaced in the example module files **/
      var values = {
        __MODULE_NAME__: moduleName.replace("kolony-module-", ''),
        __GIT_URL__: repository || ""
      }
      var camelArray = values.__MODULE_NAME__.split("-");
      camelArray = _.map(camelArray, function (string) { return string.charAt(0).toUpperCase() + string.slice(1); });

      values.__MODULE_NAME_CAMEL__ = camelArray.join("");

      camelArray = values.__MODULE_NAME_CAMEL__.split("_");
      camelArray = _.map(camelArray, function (string) { return string.charAt(0).toUpperCase() + string.slice(1); });

      values.__MODULE_NAME_CAMEL__ = camelArray.join("");

      var files = [
        path.join(moduleFolder, moduleName+".js"),
        path.join(moduleFolder, "/package.json"),
        path.join(moduleFolder, "/kolony.json"),
      ];

      // could not use neither sed nor exec(sed) so had to do it this way
      files.forEach(function(file){
        var content = fs.readFileSync(file).toString();
        Object.keys(values).forEach(function(placeholder){
          content = content.replace(new RegExp(placeholder, "g"), values[placeholder]);
        });
        fs.writeFileSync(file, content);
      });

      // add the module to the project dependencies in package.json file
      self.addModuleToProjectDependencies(moduleName, repository);

      callback();
    })
  }
  // if a repository was passed, clone it first
  if (repository){
    require('simple-git')()
      .clone(repository, moduleFolder, function(error, status){
        initModule(callback);
      })
  }else{
    wrench.mkdirSyncRecursive(moduleFolder);
    initModule(callback);
  }
}

// installs a moduel to current project
self.installModule = function(mode, moduleName, repository, callback){
  console.log('installing Kolony module '+moduleName);
  var modulesPath = path.join(self.currentProject.path, 'node_modules');
  var modulePath = path.join(modulesPath, moduleName);
  switch(mode){
    case 'npm':
      npmi({
        name: moduleName,
        path: self.currentProject.path,
        forceInstall: false,
        npmLoad: {
            loglevel: 'silent'
        }
      }, function (error, result) {
      if (error) return callback(error);

      // check if valid kolony module (has kolony.json file)
      if (!fs.existsSync(path.join(modulePath, 'kolony.json'))){
        // if not, error out and delete the installed file
        rm("-rf", modulePath);
        return callback(new Error(moduleName+' is not a valid kolony module!'));
      }

      // add it to project dependencies
      self.addModuleToProjectDependencies(moduleName);
      // check if has module-dependencies
      // if yes, install them

      callback();
    });
    break;
    case 'git':
      var modulePath = path.join(self.currentProject.path, 'node_modules', moduleName);
      require('simple-git')()
      .clone(repository, modulePath, function(error, status){
        if (error) return callback(error);

        // check if valid kolony module (has kolony.json file)
        if (!fs.existsSync(path.join(modulePath, 'kolony.json'))){
          // if not, error out and delete the installed file
          rm("-rf", modulePath);
          return callback(new Error(moduleName+' is not a valid kolony module!'));
        }

        //install node dependencies
        npmi({
          path: modulePath,
          forceInstall: false,
          npmLoad: {
              loglevel: 'silent'
          }
        }, function (error, result) {
          if (error) return callback(error);

          // add it to project dependencies
          self.addModuleToProjectDependencies(moduleName, repository);

          self.moduleController.setModuleByName(moduleName);

          var kolonyModuleDependencies = self.moduleController.getKolonyDependencies();

          var depenciesInstallCalls = [];

          // check if has module-dependencies
          if (kolonyModuleDependencies) {
            console.log('installing Kolony module dependecies for ('+moduleName+')');
            Object.keys(kolonyModuleDependencies).forEach(function(dependencyModuleName){
              var repository = kolonyModuleDependencies[dependencyModuleName].replace('git+ssh://', '');
              if (! self.isDependecy(dependencyModuleName)){
                depenciesInstallCalls.push(function(callback){
                  // check if it's a git repo
                  var mode;
                  if (repository.indexOf(".git")>0){
                    // use git
                    mode = 'git';
                  }else{
                    mode = 'npm';
                  }
                  self.installModule(mode, dependencyModuleName, repository, function(error){
                    return callback(error);
                  });
                })
              }else{
                console.log('skipping '+dependencyModuleName+" as it's already present in project dependecies");
              }
            });

            async.series(depenciesInstallCalls, function(error){
              callback(error);
            });
          }
        });
      })
    break;
  }
}

//adds a module to the project's package.json file
self.addModuleToProjectDependencies = function(moduleName, repository){
  if (self.packageInfo.dependencies === undefined) self.packageInfo.dependencies = {};

  if (repository){
    // if a repository is used, prepend the 'git' string so npm can install it
    self.packageInfo.dependencies[moduleName] = "git+"+repository.replace('git@', 'ssh@');
  }else{
    // if no repository is present, just put a wildcar
    self.packageInfo.dependencies[moduleName] = "*";
  }
  self.writePackageFile();
}

//gets all availeble kolonies
self.getAvailableKolonies = function(){
  var kolonies = [];

  var koloniesPath = path.join(self.currentProject.path, 'kolonies')
  var content = fs.readdirSync(koloniesPath);

  if (content && content.length>0){
    content.forEach(function(entry){
      if (! fs.statSync(koloniesPath+"/"+entry).isDirectory()){
        if (entry.indexOf(".json")>-1){
          kolonies.push(entry.replace(".json", ''));
        }
      }
    })
  }

  return kolonies;
}

// gets all kolony module project dependecies
self.getKolonyDependencies = function(){
  var dependencies = {};
  if (self.packageInfo.dependencies) {
    Object.keys(self.packageInfo.dependencies).forEach(function(moduleName){
      if (moduleName.indexOf('kolony-module')>=0){
        dependencies[moduleName] = self.packageInfo.dependencies[moduleName];
      }
    })
  }
  return dependencies;
}

//get all installed kolony modules
self.getInstalledKolonyModules = function(){
  var modulesPath = path.join(self.currentProject.path, 'node_modules');
  var content = fs.readdirSync(modulesPath);
  var modules = [];
  if (content && content.length>0){
    content.forEach(function(entry){
      if (fs.statSync(path.join(modulesPath, entry)).isDirectory()){
        if (entry.indexOf("kolony-module")>=0){
          modules.push(entry);
        }
      }
    })
  }
  return modules;
}

//check if a module is installed
self.isModuleInstalled = function(module){
  var modulesPath = path.join(self.currentProject.path, 'node_modules');
  var modulePath = path.join(modulesPath, module);

  return fs.existsSync(modulePath);
}

//check if a module is in dependencies
self.isDependecy = function(module){
  return (self.packageInfo.dependencies && self.packageInfo.dependencies[module]!==undefined);
}

module.exports = self;
